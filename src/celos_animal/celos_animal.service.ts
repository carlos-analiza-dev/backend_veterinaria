import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CreateCelosAnimalDto } from './dto/create-celos_animal.dto';
import { UpdateCelosAnimalDto } from './dto/update-celos_animal.dto';
import { CelosAnimal } from './entities/celos_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CelosAnimalService {
  constructor(
    @InjectRepository(CelosAnimal)
    private celosAnimalRepository: Repository<CelosAnimal>,
    @InjectRepository(AnimalFinca)
    private animalRepository: Repository<AnimalFinca>,
  ) {}

  private readonly ESPECIE_CONFIG = {
    BOVINO: {
      duracionHoras: { min: 6, max: 30, promedio: 18 },
      cicloDias: { min: 18, max: 24, promedio: 21 },
      mejorMomentoIA: '12-18 horas después del inicio',
      coloresSecrecion: ['clara', 'transparente', 'viscosa'],
    },
    EQUINO: {
      duracionHoras: { min: 96, max: 168, promedio: 120 },
      cicloDias: { min: 19, max: 22, promedio: 21 },
      mejorMomentoIA: 'Cada 48 horas durante el celo',
      coloresSecrecion: ['blanquecina', 'amarillenta'],
    },
    CAPRINO: {
      duracionHoras: { min: 24, max: 48, promedio: 36 },
      cicloDias: { min: 18, max: 21, promedio: 19 },
      mejorMomentoIA: '12-24 horas después del inicio',
      coloresSecrecion: ['clara', 'lechosa'],
    },
    PORCINO: {
      duracionHoras: { min: 48, max: 72, promedio: 60 },
      cicloDias: { min: 18, max: 21, promedio: 19 },
      mejorMomentoIA: '24-36 horas después del inicio',
      coloresSecrecion: ['clara', 'viscosa'],
    },
    OVINO: {
      duracionHoras: { min: 24, max: 36, promedio: 30 },
      cicloDias: { min: 14, max: 19, promedio: 17 },
      mejorMomentoIA: '12-24 horas después del inicio',
      coloresSecrecion: ['clara', 'turbia'],
    },
  };

  async create(createCelosAnimalDto: CreateCelosAnimalDto) {
    const animal = await this.animalRepository.findOne({
      where: { id: createCelosAnimalDto.animalId },
      relations: ['especie'],
    });

    if (!animal) {
      throw new NotFoundException(
        `Animal con ID ${createCelosAnimalDto.animalId} no encontrado`,
      );
    }

    this.validarAnimalParaCelo(animal);

    const fechaInicio = new Date(createCelosAnimalDto.fechaInicio);
    const fechaFin = createCelosAnimalDto.fechaFin
      ? new Date(createCelosAnimalDto.fechaFin)
      : null;

    await this.validarSinCeloActivo(animal.id, fechaInicio, fechaFin);

    this.validarFechas(fechaInicio, fechaFin);

    if (!createCelosAnimalDto.numeroCelo) {
      createCelosAnimalDto.numeroCelo = await this.calcularNumeroCelo(
        animal.id,
      );
    }

    if (fechaFin) {
      await this.validarDuracionCelo(
        animal.especie.nombre,
        fechaInicio,
        fechaFin,
      );
    }

    if (createCelosAnimalDto.signos_observados?.secreciones) {
      this.validarSecreciones(
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
      .where('animal.sexo = :sexo', { sexo: 'HEMBRA' })
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

        if (diasRestantes >= 0 && diasRestantes <= 7) {
          proximos.push({
            animalId: animal.id,
            identificador: animal.identificador,
            fechaProbable: prediccion.fechaProbable,
            diasRestantes,
            nivelConfianza: prediccion.nivelConfianza,
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
      await this.validarDuracionCelo(
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

    const especie = animal.especie.nombre as keyof typeof this.ESPECIE_CONFIG;
    const config = this.ESPECIE_CONFIG[especie] || this.ESPECIE_CONFIG.BOVINO;

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

  async finalizarCelo(id: string, fechaFin?: Date): Promise<CelosAnimal> {
    const celo = await this.findOne(id);

    if (celo.fechaFin) {
      throw new BadRequestException('Este celo ya ha sido finalizado');
    }

    celo.fechaFin = fechaFin || new Date();
    await this.validarDuracionCelo(
      celo.animal.especie.nombre,
      celo.fechaInicio,
      celo.fechaFin,
    );

    return await this.celosAnimalRepository.save(celo);
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

  private validarAnimalParaCelo(animal: AnimalFinca): void {
    if (animal.castrado || animal.esterelizado) {
      throw new BadRequestException(
        'El animal está castrado/esterilizado, no puede presentar celo',
      );
    }

    if (animal.sexo?.toUpperCase() !== 'HEMBRA') {
      throw new BadRequestException('Solo las hembras pueden registrar celo');
    }
  }

  private async calcularNumeroCelo(animalId: string): Promise<number> {
    const count = await this.celosAnimalRepository.count({
      where: { animal: { id: animalId } },
    });
    return count + 1;
  }

  private async validarDuracionCelo(
    especie: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<void> {
    const duracionHoras =
      (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
    const config =
      this.ESPECIE_CONFIG[especie as keyof typeof this.ESPECIE_CONFIG];

    if (
      config &&
      (duracionHoras < config.duracionHoras.min ||
        duracionHoras > config.duracionHoras.max)
    ) {
      throw new BadRequestException(
        `La duración del celo para ${especie} debe estar entre ${config.duracionHoras.min} y ${config.duracionHoras.max} horas. ` +
          `Duración registrada: ${duracionHoras.toFixed(1)} horas`,
      );
    }
  }

  private validarSecreciones(especie: string, secreciones: string): void {
    const config =
      this.ESPECIE_CONFIG[especie as keyof typeof this.ESPECIE_CONFIG];
    if (
      config &&
      !config.coloresSecrecion.includes(secreciones?.toLowerCase())
    ) {
      console.warn(`Secreción inusual para ${especie}: ${secreciones}`);
    }
  }

  private async validarSinCeloActivo(
    animalId: string,
    fechaInicio: Date,
    fechaFin?: Date,
  ): Promise<void> {
    const queryBuilder = this.celosAnimalRepository
      .createQueryBuilder('celo')
      .where('celo.animalId = :animalId', { animalId })
      .andWhere(
        '(' +
          'celo.fechaFin IS NULL OR ' +
          '(:fechaInicio BETWEEN celo.fechaInicio AND COALESCE(celo.fechaFin, :infinito) OR ' +
          'COALESCE(:fechaFin, :infinito) BETWEEN celo.fechaInicio AND COALESCE(celo.fechaFin, :infinito) OR ' +
          'celo.fechaInicio BETWEEN :fechaInicio AND COALESCE(:fechaFin, :infinito))' +
          ')',
        {
          fechaInicio,
          fechaFin: fechaFin || new Date('2999-12-31'),
          infinito: new Date('2999-12-31'),
        },
      );

    const celosActivos = await queryBuilder.getMany();

    if (celosActivos.length > 0) {
      const celo = celosActivos[0];
      const estado = celo.fechaFin ? 'activo' : 'solapado';
      throw new BadRequestException(
        `El animal ya tiene un registro de celo ${estado} para este período. ` +
          `Inicio: ${celo.fechaInicio.toLocaleDateString()} ${celo.fechaFin ? `- Fin: ${celo.fechaFin.toLocaleDateString()}` : '(activo)'}`,
      );
    }
  }

  private async validarSinCeloActivoParaUpdate(
    celoId: string,
    animalId: string,
    fechaInicio: Date,
    fechaFin?: Date,
  ): Promise<void> {
    const queryBuilder = this.celosAnimalRepository
      .createQueryBuilder('celo')
      .where('celo.animalId = :animalId', { animalId })
      .andWhere('celo.id != :celoId', { celoId })
      .andWhere(
        '(' +
          'celo.fechaFin IS NULL OR ' +
          '(:fechaInicio BETWEEN celo.fechaInicio AND COALESCE(celo.fechaFin, :infinito) OR ' +
          'COALESCE(:fechaFin, :infinito) BETWEEN celo.fechaInicio AND COALESCE(celo.fechaFin, :infinito) OR ' +
          'celo.fechaInicio BETWEEN :fechaInicio AND COALESCE(:fechaFin, :infinito))' +
          ')',
        {
          fechaInicio,
          fechaFin: fechaFin || new Date('2999-12-31'),
          infinito: new Date('2999-12-31'),
        },
      );

    const celosActivos = await queryBuilder.getMany();

    if (celosActivos.length > 0) {
      const celo = celosActivos[0];
      throw new BadRequestException(
        `La actualización causaría solapamiento con otro celo existente. ` +
          `ID del celo conflictivo: ${celo.id}`,
      );
    }
  }

  private validarFechas(fechaInicio: Date, fechaFin?: Date): void {
    const ahora = new Date();

    if (fechaInicio > ahora) {
      throw new BadRequestException('No puedes registrar un celo en el futuro');
    }

    if (fechaFin) {
      if (fechaFin <= fechaInicio) {
        throw new BadRequestException(
          'La fecha fin debe ser posterior a la fecha de inicio',
        );
      }

      if (fechaFin > ahora) {
        throw new BadRequestException('La fecha fin no puede ser futura');
      }

      const diasDiferencia =
        (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);
      if (diasDiferencia > 30) {
        throw new BadRequestException(
          'El período de celo no puede durar más de 30 días',
        );
      }
    }
  }
}
