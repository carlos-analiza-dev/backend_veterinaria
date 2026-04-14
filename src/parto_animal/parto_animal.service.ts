import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePartoAnimalDto } from './dto/create-parto_animal.dto';
import { UpdatePartoAnimalDto } from './dto/update-parto_animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PartoAnimal } from './entities/parto_animal.entity';
import { Repository } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { EstadoCeloAnimal } from 'src/interfaces/celos.animal.enum';
import {
  EstadoCria,
  EstadoParto,
  TipoParto,
} from 'src/interfaces/partos.enums';
import { PartoAnimalValidationService } from './parto_animal.validation.service';
import { FiltrarPartosDto } from './dto/filtrar-partos.dto';
import { instanceToPlain } from 'class-transformer';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class PartoAnimalService {
  constructor(
    @InjectRepository(PartoAnimal)
    private readonly partoRepository: Repository<PartoAnimal>,
    @InjectRepository(AnimalFinca)
    private readonly animalRepository: Repository<AnimalFinca>,
    @InjectRepository(ServicioReproductivo)
    private readonly servicioRepository: Repository<ServicioReproductivo>,
    @InjectRepository(CelosAnimal)
    private readonly celoRepository: Repository<CelosAnimal>,
    private validationService: PartoAnimalValidationService,
  ) {}
  async create(createPartoAnimalDto: CreatePartoAnimalDto, cliente: Cliente) {
    try {
      const { hembra, servicio } =
        await this.validationService.validarTodasLasValidacionesParto(
          createPartoAnimalDto.hembra_id,
          createPartoAnimalDto.servicio_id,
          createPartoAnimalDto.fecha_parto,
          createPartoAnimalDto.numero_crias,
          createPartoAnimalDto.crias,
        );

      await this.validationService.validarEdadMinimaParto(hembra);

      let diasGestacion: number;
      let semanasGestacion: number;

      if (servicio) {
        const gestacion = this.validationService.calcularGestacion(
          servicio.fecha_servicio,
          createPartoAnimalDto.fecha_parto,
          hembra.especie.nombre,
          createPartoAnimalDto.dias_gestacion,
        );

        diasGestacion = gestacion.dias;
        semanasGestacion = gestacion.semanas;

        this.validationService.validarRangoGestacion(
          diasGestacion,
          hembra.especie.nombre,
        );
      } else {
        const gestacion = this.validationService.calcularGestacion(
          undefined,
          undefined,
          hembra.especie.nombre,
          createPartoAnimalDto.dias_gestacion,
        );

        diasGestacion = gestacion.dias;
        semanasGestacion = gestacion.semanas;
      }

      const numeroCrias =
        createPartoAnimalDto.numero_crias ||
        createPartoAnimalDto.crias?.length ||
        1;

      const numeroCriasVivas =
        createPartoAnimalDto.numero_crias_vivas ||
        createPartoAnimalDto.crias?.filter((c) => c.estado === EstadoCria.VIVA)
          .length ||
        0;

      const numeroCriasMuertas =
        createPartoAnimalDto.numero_crias_muertas ||
        createPartoAnimalDto.crias?.filter(
          (c) => c.estado === EstadoCria.MUERTA,
        ).length ||
        0;

      if (
        createPartoAnimalDto.crias &&
        createPartoAnimalDto.crias.length !== numeroCrias
      ) {
        throw new BadRequestException(
          `El número de crías registradas (${createPartoAnimalDto.crias.length}) no coincide con el número declarado (${numeroCrias})`,
        );
      }

      if (createPartoAnimalDto.crias && createPartoAnimalDto.crias.length > 0) {
        await this.validationService.validarIdentificadoresCrias(
          createPartoAnimalDto.crias,
          hembra.finca.id,
        );
      }

      const parto = this.partoRepository.create({
        ...createPartoAnimalDto,
        hembra,
        servicio_asociado: servicio,
        numero_crias: numeroCrias,
        numero_crias_vivas: numeroCriasVivas,
        numero_crias_muertas: numeroCriasMuertas,
        dias_gestacion: diasGestacion,
        semanas_gestacion: semanasGestacion,
        creadoPorId: cliente.id,
      });

      const partoGuardado = await this.partoRepository.save(parto);

      await this.animalRepository.save(hembra);

      if (servicio) {
        servicio.exitoso = true;
        await this.servicioRepository.save(servicio);

        if (servicio.celo_asociado) {
          servicio.celo_asociado.estado = EstadoCeloAnimal.PREÑADO;
          await this.celoRepository.save(servicio.celo_asociado);
        }
      }

      return partoGuardado;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new BadRequestException('Error al crear el registro de parto');
    }
  }

  async findAll(filtros: FiltrarPartosDto) {
    const {
      finca_id,
      hembra_id,
      tipo_parto,
      estado,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 10,
    } = filtros;

    const query = this.partoRepository
      .createQueryBuilder('parto')
      .leftJoinAndSelect('parto.hembra', 'hembra')
      .leftJoinAndSelect('hembra.finca', 'finca')
      .leftJoinAndSelect('parto.servicio_asociado', 'servicio')
      .orderBy('parto.fecha_parto', 'DESC');

    if (finca_id) {
      query.andWhere('finca.id = :finca_id', { finca_id });
    }

    if (hembra_id) {
      query.andWhere('hembra.id = :hembra_id', { hembra_id });
    }

    if (tipo_parto) {
      query.andWhere('parto.tipo_parto = :tipo_parto', { tipo_parto });
    }

    if (estado) {
      query.andWhere('parto.estado = :estado', { estado });
    }

    if (fecha_desde) {
      query.andWhere('parto.fecha_parto >= :fecha_desde', {
        fecha_desde,
      });
    }

    if (fecha_hasta) {
      query.andWhere('parto.fecha_parto <= :fecha_hasta', {
        fecha_hasta,
      });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const parto = await this.partoRepository.findOne({
      where: { id },
      relations: ['hembra', 'servicio_asociado'],
    });
    if (!parto)
      throw new NotFoundException('No se encontro el parto en estos momentos');
    return instanceToPlain(parto);
  }

  async update(
    id: string,
    updatePartoAnimalDto: UpdatePartoAnimalDto,
    cliente: Cliente,
  ) {
    try {
      const parto = await this.partoRepository.findOne({
        where: { id },
        relations: ['hembra', 'hembra.finca', 'servicio_asociado'],
      });

      if (!parto) {
        throw new NotFoundException(`Parto con ID ${id} no encontrado`);
      }

      if (
        updatePartoAnimalDto.hembra_id &&
        updatePartoAnimalDto.hembra_id !== parto.hembra.id
      ) {
        throw new BadRequestException(
          'No se puede modificar la hembra del parto',
        );
      }

      if (
        updatePartoAnimalDto.servicio_id &&
        updatePartoAnimalDto.servicio_id !== parto.servicio_asociado?.id
      ) {
        throw new BadRequestException(
          'No se puede modificar el servicio asociado al parto',
        );
      }

      if (
        updatePartoAnimalDto.fecha_parto &&
        parto.estado === EstadoParto.COMPLETADO
      ) {
        throw new BadRequestException(
          'No se puede modificar la fecha de un parto ya completado',
        );
      }

      if (
        updatePartoAnimalDto.numero_parto &&
        updatePartoAnimalDto.numero_parto !== parto.numero_parto
      ) {
        throw new BadRequestException(
          'No se puede modificar el número de parto',
        );
      }

      if (updatePartoAnimalDto.crias && updatePartoAnimalDto.crias.length > 0) {
        const identificadoresExistentes = new Set(
          parto.crias?.map((c) => c.identificador).filter(Boolean) || [],
        );

        const nuevasCrias = updatePartoAnimalDto.crias.filter(
          (cria) =>
            cria.identificador &&
            !identificadoresExistentes.has(cria.identificador),
        );

        if (nuevasCrias.length > 0) {
          await this.validationService.validarIdentificadoresCrias(
            nuevasCrias,
            parto.hembra.finca.id,
          );
        }

        const numeroCriasDeclarado =
          updatePartoAnimalDto.numero_crias || parto.numero_crias;
        if (updatePartoAnimalDto.crias.length !== numeroCriasDeclarado) {
          throw new BadRequestException(
            `El número de crías registradas (${updatePartoAnimalDto.crias.length}) no coincide con el número declarado (${numeroCriasDeclarado})`,
          );
        }

        const vivas = updatePartoAnimalDto.crias.filter(
          (c) => c.estado === EstadoCria.VIVA,
        ).length;
        const muertas = updatePartoAnimalDto.crias.filter(
          (c) => c.estado === EstadoCria.MUERTA,
        ).length;

        updatePartoAnimalDto.numero_crias_vivas = vivas;
        updatePartoAnimalDto.numero_crias_muertas = muertas;
      }

      if (
        updatePartoAnimalDto.tipo_parto &&
        !Object.values(TipoParto).includes(updatePartoAnimalDto.tipo_parto)
      ) {
        throw new BadRequestException('Tipo de parto inválido');
      }

      if (
        updatePartoAnimalDto.estado &&
        !Object.values(EstadoParto).includes(updatePartoAnimalDto.estado)
      ) {
        throw new BadRequestException('Estado de parto inválido');
      }

      if (updatePartoAnimalDto.dias_gestacion) {
        updatePartoAnimalDto.semanas_gestacion = Math.round(
          updatePartoAnimalDto.dias_gestacion / 7,
        );
      }

      if (updatePartoAnimalDto.fecha_parto && parto.servicio_asociado) {
        const fechaServicio = new Date(parto.servicio_asociado.fecha_servicio);
        const fechaParto = new Date(updatePartoAnimalDto.fecha_parto);

        const diasGestacion = Math.round(
          (fechaParto.getTime() - fechaServicio.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        updatePartoAnimalDto.dias_gestacion = diasGestacion;
        updatePartoAnimalDto.semanas_gestacion = Math.round(diasGestacion / 7);

        this.validationService.validarRangoGestacion(
          diasGestacion,
          parto.hembra.especie.nombre,
        );
      }

      Object.assign(parto, updatePartoAnimalDto);

      const partoActualizado = await this.partoRepository.save({
        ...parto,
        actualizadoPorId: cliente.id,
      });

      return partoActualizado;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el registro de parto');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} partoAnimal`;
  }
}
