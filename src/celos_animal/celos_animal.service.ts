import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateCelosAnimalDto } from './dto/create-celos_animal.dto';
import { UpdateCelosAnimalDto } from './dto/update-celos_animal.dto';
import { CelosAnimal } from './entities/celos_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { instanceToPlain } from 'class-transformer';
import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import { EstadoCeloAnimal } from 'src/interfaces/celos.animal.enum';
import { EstadoServicio } from 'src/interfaces/servicios-reproductivos.enum';
import { CelosAnimalValidationService } from './celos-animal-validation.service';
import { ESPECIE_CONFIG } from 'src/interfaces/especies-config';

@Injectable()
export class CelosAnimalService {
  constructor(
    @InjectRepository(CelosAnimal)
    private celosAnimalRepository: Repository<CelosAnimal>,
    @InjectRepository(AnimalFinca)
    private animalRepository: Repository<AnimalFinca>,
    @InjectRepository(ServicioReproductivo)
    private servicioRepository: Repository<ServicioReproductivo>,
    private validationService: CelosAnimalValidationService,
  ) {}

  async create(createCelosAnimalDto: CreateCelosAnimalDto) {
    const animal = await this.animalRepository.findOne({
      where: { id: createCelosAnimalDto.animalId },
      relations: ['especie', 'celos'],
    });

    if (!animal) {
      throw new NotFoundException(
        `Animal con ID ${createCelosAnimalDto.animalId} no encontrado`,
      );
    }

    await this.validationService.validarAnimalParaCelo(animal);
    await this.validationService.validarAnimalNoPreñado(animal);

    const fechaInicio = new Date(createCelosAnimalDto.fechaInicio);
    const fechaFin = createCelosAnimalDto.fechaFin
      ? new Date(createCelosAnimalDto.fechaFin)
      : null;

    await this.validationService.validarSinCeloActivo(
      animal.id,
      fechaInicio,
      fechaFin,
    );

    this.validationService.validarFechas(fechaInicio, fechaFin);

    if (!createCelosAnimalDto.numeroCelo) {
      createCelosAnimalDto.numeroCelo =
        await this.validationService.calcularNumeroCelo(animal.id);
    }

    if (fechaFin) {
      await this.validationService.validarDuracionCelo(
        animal.especie.nombre,
        fechaInicio,
        fechaFin,
      );
    }

    if (createCelosAnimalDto.signos_observados?.secreciones) {
      this.validationService.validarSecreciones(
        animal.especie.nombre,
        createCelosAnimalDto.signos_observados.secreciones,
      );
    }

    const nuevoCelo = this.celosAnimalRepository.create({
      ...createCelosAnimalDto,
      animal: animal,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
    });

    await this.celosAnimalRepository.save(nuevoCelo);

    return 'Celo guardado exitosamente';
  }

  async findAll(paginationDto: PaginationDto, cliente: Cliente) {
    const propietarioId = cliente.id;

    const {
      animalId,
      fincaId,
      especie,
      fechaInicio,
      fechaFin,
      intensidad,
      activos,
      offset = 1,
      limit = 10,
    } = paginationDto;

    const query = this.celosAnimalRepository
      .createQueryBuilder('celo')
      .leftJoinAndSelect('celo.animal', 'animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .leftJoinAndSelect('animal.finca', 'finca')
      .leftJoinAndSelect('animal.propietario', 'propietario')
      .where('propietario.id = :propietarioId', { propietarioId });

    if (animalId) {
      query.andWhere('animal.id = :animalId', { animalId });
    }

    if (fincaId) {
      query.andWhere('finca.id = :fincaId', { fincaId });
    }

    if (especie) {
      query.andWhere('especie.nombre = :especie', { especie });
    }

    if (fechaInicio && fechaFin) {
      query.andWhere('celo.fechaInicio BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      });
    }

    if (intensidad) {
      query.andWhere('celo.intensidad = :intensidad', { intensidad });
    }

    if (activos) {
      query.andWhere('celo.fechaFin IS NULL');
    }

    const total = await query.getCount();

    const data = await query
      .orderBy('celo.fechaInicio', 'DESC')
      .skip((offset - 1) * limit)
      .take(limit)
      .getMany();

    const dataPlain = instanceToPlain(data);

    return {
      celos: dataPlain,
      total,
      offset,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAlertasProximosCelos(fincaId?: string): Promise<{
    proximos: Array<{
      animalId: string;
      identificador: string;
      fechaProbable: Date;
      diasRestantes: number;
      nivelConfianza: number;
    }>;
    total: number;
  }> {
    const query = this.animalRepository
      .createQueryBuilder('animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .leftJoinAndSelect('animal.finca', 'finca')
      .where('animal.sexo = :sexo', { sexo: 'Hembra' })
      .andWhere('animal.castrado = :castrado', { castrado: false });

    if (fincaId) {
      query.andWhere('finca.id = :fincaId', { fincaId });
    }

    const animales = await query.getMany();
    const proximos = [];

    for (const animal of animales) {
      try {
        const prediccion = await this.predecirProximoCelo(animal.id);
        const hoy = new Date();
        const diasRestantes = Math.ceil(
          (prediccion.fechaProbable.getTime() - hoy.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        let nivel = 'BAJO';

        if (diasRestantes <= 7) nivel = 'ALTO';
        else if (diasRestantes <= 15) nivel = 'MEDIO';
        else if (diasRestantes <= 30) nivel = 'BAJO';

        if (diasRestantes >= 0 && diasRestantes <= 30) {
          proximos.push({
            animalId: animal.id,
            identificador: animal.identificador,
            fechaProbable: prediccion.fechaProbable,
            diasRestantes,
            nivelConfianza: prediccion.nivelConfianza,
            alerta: nivel,
          });
        }
      } catch (error) {
        continue;
      }
    }

    return {
      proximos: proximos.sort((a, b) => a.diasRestantes - b.diasRestantes),
      total: proximos.length,
    };
  }

  async findOne(id: string): Promise<CelosAnimal> {
    const celo = await this.celosAnimalRepository.findOne({
      where: { id },
      relations: ['animal', 'animal.especie', 'animal.finca'],
    });

    if (!celo) {
      throw new NotFoundException(`Celo con ID ${id} no encontrado`);
    }

    return celo;
  }

  async update(
    id: string,
    updateCelosAnimalDto: UpdateCelosAnimalDto,
  ): Promise<CelosAnimal> {
    const celo = await this.findOne(id);

    if (updateCelosAnimalDto.fechaFin) {
      await this.validationService.validarDuracionCelo(
        celo.animal.especie.nombre,
        celo.fechaInicio,
        new Date(updateCelosAnimalDto.fechaFin),
      );
    }

    Object.assign(celo, updateCelosAnimalDto);
    return await this.celosAnimalRepository.save(celo);
  }

  async remove(id: string): Promise<{ message: string }> {
    const celo = await this.findOne(id);
    await this.celosAnimalRepository.remove(celo);
    return { message: 'Registro de celo eliminado correctamente' };
  }

  async getCelosActivosByAnimal(animalId: string): Promise<CelosAnimal[]> {
    const fechaActual = new Date();

    return await this.celosAnimalRepository
      .createQueryBuilder('celo')
      .leftJoinAndSelect('celo.animal', 'animal')
      .where('celo.animalId = :animalId', { animalId })
      .andWhere('celo.estado = :estado', { estado: EstadoCeloAnimal.ACTIVO })
      .andWhere('celo.fechaInicio <= :fechaActual', { fechaActual })
      .andWhere('(celo.fechaFin IS NULL OR celo.fechaFin >= :fechaActual)', {
        fechaActual,
      })
      .orderBy('celo.fechaInicio', 'DESC')
      .getMany();
  }

  async getAnimalesEnCeloActivo(fincaId?: string): Promise<CelosAnimal[]> {
    const query = this.celosAnimalRepository
      .createQueryBuilder('celo')
      .leftJoinAndSelect('celo.animal', 'animal')
      .leftJoinAndSelect('animal.especie', 'especie')
      .leftJoinAndSelect('animal.finca', 'finca')
      .where('celo.fechaFin IS NULL');

    if (fincaId) {
      query.andWhere('finca.id = :fincaId', { fincaId });
    }

    return await query.getMany();
  }

  async predecirProximoCelo(animalId: string): Promise<{
    fechaProbable: Date;
    ventanaInicio: Date;
    ventanaFin: Date;
    nivelConfianza: number;
    recomendaciones: string;
  }> {
    const animal = await this.animalRepository.findOne({
      where: { id: animalId },
      relations: ['especie'],
    });

    if (!animal) {
      throw new NotFoundException(`Animal con ID ${animalId} no encontrado`);
    }

    const ultimosCelos = await this.celosAnimalRepository.find({
      where: { animal: { id: animalId } },
      order: { fechaInicio: 'DESC' },
      take: 3,
    });

    if (ultimosCelos.length === 0) {
      throw new BadRequestException(
        'No hay suficiente historial de celos para predecir',
      );
    }

    const especieKey = animal.especie.nombre.toUpperCase();

    const config = ESPECIE_CONFIG[especieKey as keyof typeof ESPECIE_CONFIG];

    let intervaloPromedio = config.cicloDias.promedio;
    if (ultimosCelos.length >= 2) {
      const intervalos = [];
      for (let i = 0; i < ultimosCelos.length - 1; i++) {
        const dias = Math.abs(
          (ultimosCelos[i].fechaInicio.getTime() -
            ultimosCelos[i + 1].fechaInicio.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        intervalos.push(dias);
      }
      intervaloPromedio =
        intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
    }

    const ultimoCelo = ultimosCelos[0];
    const fechaProbable = new Date(ultimoCelo.fechaInicio);
    fechaProbable.setDate(fechaProbable.getDate() + intervaloPromedio);

    const ventanaInicio = new Date(fechaProbable);
    ventanaInicio.setDate(ventanaInicio.getDate() - 3);

    const ventanaFin = new Date(fechaProbable);
    ventanaFin.setDate(ventanaFin.getDate() + 3);

    const nivelConfianza = Math.min(ultimosCelos.length * 25, 90);

    return {
      fechaProbable,
      ventanaInicio,
      ventanaFin,
      nivelConfianza,
      recomendaciones: `Observar al animal entre el ${ventanaInicio.toLocaleDateString()} y ${ventanaFin.toLocaleDateString()}. ${config.mejorMomentoIA}`,
    };
  }

  async getEstadisticasPorFinca(
    fincaId: string,
    periodo: 'semana' | 'mes' | 'año' = 'mes',
  ) {
    const ahora = new Date();
    let fechaInicio = new Date();

    switch (periodo) {
      case 'semana':
        fechaInicio.setDate(ahora.getDate() - 7);
        break;
      case 'mes':
        fechaInicio.setMonth(ahora.getMonth() - 1);
        break;
      case 'año':
        fechaInicio.setFullYear(ahora.getFullYear() - 1);
        break;
    }

    const celos = await this.celosAnimalRepository
      .createQueryBuilder('celo')
      .leftJoinAndSelect('celo.animal', 'animal')
      .leftJoinAndSelect('animal.finca', 'finca')
      .leftJoinAndSelect('animal.especie', 'especie')
      .where('finca.id = :fincaId', { fincaId })
      .andWhere('celo.fechaInicio >= :fechaInicio', { fechaInicio })
      .getMany();

    const totalCelos = celos.length;
    const celosPorEspecie = {};
    const intensidades = { BAJO: 0, MEDIO: 0, ALTO: 0, MUY_ALTO: 0 };
    const metodosDeteccion = {};

    celos.forEach((celo) => {
      const especie = celo.animal.especie.nombre;
      celosPorEspecie[especie] = (celosPorEspecie[especie] || 0) + 1;

      intensidades[celo.intensidad]++;

      metodosDeteccion[celo.metodo_deteccion] =
        (metodosDeteccion[celo.metodo_deteccion] || 0) + 1;
    });

    return {
      periodo,
      totalCelos,
      promedioPorDia: (
        totalCelos /
        ((ahora.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
      ).toFixed(2),
      celosPorEspecie,
      intensidades,
      metodosDeteccion,
      animalesEnCeloActivo: await this.getAnimalesEnCeloActivo(fincaId).then(
        (r) => r.length,
      ),
    };
  }

  //SERVICIOS

  async actualizarEstadoPorServicio(celoId: string): Promise<CelosAnimal> {
    const celo = await this.findOne(celoId);

    if (!celo) {
      throw new NotFoundException(`Celo con ID ${celoId} no encontrado`);
    }

    const servicios = await this.servicioRepository.find({
      where: { celo_asociado: { id: celoId } },
    });

    if (servicios.length > 0) {
      if (celo.estado === EstadoCeloAnimal.ACTIVO) {
        celo.estado = EstadoCeloAnimal.SERVIDO;
        await this.celosAnimalRepository.save(celo);
      }

      const servicioExitoso = servicios.some(
        (servicio) => servicio.exitoso === true,
      );

      if (servicioExitoso && celo.fechaFin) {
        celo.estado = EstadoCeloAnimal.PREÑADO;
        await this.celosAnimalRepository.save(celo);
      }
    } else if (celo.fechaFin && celo.fechaFin <= new Date()) {
      if (celo.estado !== EstadoCeloAnimal.FINALIZADO) {
        celo.estado = EstadoCeloAnimal.SIN_SERVICIO;
        await this.celosAnimalRepository.save(celo);
      }
    }

    return celo;
  }

  async finalizarCelo(id: string, fechaFin?: Date): Promise<CelosAnimal> {
    const celo = await this.findOne(id);

    if (celo.fechaFin) {
      throw new BadRequestException('Este celo ya ha sido finalizado');
    }

    celo.fechaFin = fechaFin || new Date();
    await this.validationService.validarDuracionCelo(
      celo.animal.especie.nombre,
      celo.fechaInicio,
      celo.fechaFin,
    );

    const servicios = await this.servicioRepository.find({
      where: { celo_asociado: { id: id } },
    });

    if (servicios.length > 0) {
      celo.estado = EstadoCeloAnimal.SERVIDO;
    } else {
      celo.estado = EstadoCeloAnimal.SIN_SERVICIO;
    }

    return await this.celosAnimalRepository.save(celo);
  }

  async actualizarEstadoPorNuevoServicio(servicioId: string): Promise<void> {
    const servicio = await this.servicioRepository.findOne({
      where: { id: servicioId },
      relations: ['celo_asociado'],
    });

    if (!servicio?.celo_asociado) {
      return;
    }

    const celo = servicio.celo_asociado;

    if (celo.estado === EstadoCeloAnimal.ACTIVO) {
      celo.estado = EstadoCeloAnimal.SERVIDO;
      await this.celosAnimalRepository.save(celo);
    }
  }

  async actualizarPorConfirmacionServicio(
    servicioId: string,
    exitoso: boolean,
  ): Promise<void> {
    const servicio = await this.servicioRepository.findOne({
      where: { id: servicioId },
      relations: ['celo_asociado'],
    });

    if (!servicio?.celo_asociado) {
      return;
    }

    const celo = servicio.celo_asociado;

    if (exitoso && celo.fechaFin && celo.fechaFin <= new Date()) {
      celo.estado = EstadoCeloAnimal.PREÑADO;
      await this.celosAnimalRepository.save(celo);
    } else if (!exitoso) {
      const otrosServicios = await this.servicioRepository.find({
        where: {
          celo_asociado: { id: celo.id },
          id: Not(servicioId),
        },
      });

      const tieneExitosos = otrosServicios.some((s) => s.exitoso === true);
      const tienePendientes = otrosServicios.some(
        (s) => s.exitoso === null || s.estado === EstadoServicio.REALIZADO,
      );

      if (tieneExitosos) {
        celo.estado = EstadoCeloAnimal.PREÑADO;
        await this.celosAnimalRepository.save(celo);
      } else if (
        !tienePendientes &&
        celo.fechaFin &&
        celo.fechaFin <= new Date()
      ) {
        celo.estado = EstadoCeloAnimal.NO_FECUNDADO;
        await this.celosAnimalRepository.save(celo);
      }
    }
  }
}
