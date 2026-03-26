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
import { EstadoCria } from 'src/interfaces/partos.enums';
import { PartoAnimalValidationService } from './parto_animal.validation.service';
import { FiltrarPartosDto } from './dto/filtrar-partos.dto';

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
  async create(createPartoAnimalDto: CreatePartoAnimalDto) {
    try {
      const { hembra, servicio } =
        await this.validationService.validarTodasLasValidacionesParto(
          createPartoAnimalDto.hembra_id,
          createPartoAnimalDto.servicio_id,
          createPartoAnimalDto.fecha_parto,
          createPartoAnimalDto.numero_crias,
          createPartoAnimalDto.crias,
        );

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

      const parto = this.partoRepository.create({
        ...createPartoAnimalDto,
        hembra,
        servicio_asociado: servicio,
        numero_crias: numeroCrias,
        numero_crias_vivas: numeroCriasVivas,
        numero_crias_muertas: numeroCriasMuertas,
        dias_gestacion: diasGestacion,
        semanas_gestacion: semanasGestacion,
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

      console.error('Error al crear parto:', error);
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

  findOne(id: number) {
    return `This action returns a #${id} partoAnimal`;
  }

  update(id: number, updatePartoAnimalDto: UpdatePartoAnimalDto) {
    return `This action updates a #${id} partoAnimal`;
  }

  remove(id: number) {
    return `This action removes a #${id} partoAnimal`;
  }
}
