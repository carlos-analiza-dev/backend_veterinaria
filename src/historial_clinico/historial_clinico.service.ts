import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialClinico } from './entities/historial_clinico.entity';
import { CreateHistorialClinicoDto } from './dto/create-historial_clinico.dto';
import { UpdateHistorialClinicoDto } from './dto/update-historial_clinico.dto';
import { AnimalFinca } from '../animal_finca/entities/animal_finca.entity';
import { Cita } from '../citas/entities/cita.entity';
import { HistorialDetalle } from '../historial_detalles/entities/historial_detalle.entity';
import { SubServicio } from '../sub_servicios/entities/sub_servicio.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { User } from 'src/auth/entities/auth.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class HistorialClinicoService {
  constructor(
    @InjectRepository(HistorialClinico)
    private readonly historialClinicoRepository: Repository<HistorialClinico>,
    @InjectRepository(AnimalFinca)
    private readonly animalFincaRepository: Repository<AnimalFinca>,
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
    @InjectRepository(SubServicio)
    private readonly subServicioRepository: Repository<SubServicio>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    user: User,
    createHistorialClinicoDto: CreateHistorialClinicoDto,
  ) {
    const {
      animalId,
      citaId,
      detalles = [],
      ...historialData
    } = createHistorialClinicoDto;
    const veterinario_id = user.id || '';

    const animal = await this.animalFincaRepository.findOne({
      where: { id: animalId },
    });
    if (!animal) {
      throw new NotFoundException(`Animal con ID ${animalId} no encontrado`);
    }

    const veterinario = await this.userRepository.findOne({
      where: { id: veterinario_id },
    });
    if (!veterinario) {
      throw new NotFoundException(
        `veterinario con ID ${veterinario_id} no encontrado`,
      );
    }

    let cita: Cita | undefined;
    if (citaId) {
      cita = await this.citaRepository.findOne({
        where: { id: citaId },
      });
      if (!cita) {
        throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
      }
    }

    const detallesCreados: HistorialDetalle[] = [];

    if (detalles && detalles.length > 0) {
      for (const detalleData of detalles) {
        const { subServicioId, ...detalleInfo } = detalleData;

        let subServicio: SubServicio | undefined;
        if (subServicioId) {
          subServicio = await this.subServicioRepository.findOne({
            where: { id: subServicioId },
          });
          if (!subServicio) {
            throw new NotFoundException(
              `Subservicio con ID ${subServicioId} no encontrado`,
            );
          }
        }

        const detalle = new HistorialDetalle();
        Object.assign(detalle, {
          ...detalleInfo,

          subServicio,
        });

        detallesCreados.push(detalle);
      }
    }

    const historial = this.historialClinicoRepository.create({
      ...historialData,
      animal,
      veterinario,
      cita,
      detalles: detallesCreados,
    });

    await this.historialClinicoRepository.save(historial);

    return 'Historial Creado Exitosamente';
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const veterinarioId = user.id;
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const [historial, total] = await this.historialClinicoRepository
        .createQueryBuilder('historial')
        .leftJoinAndSelect('historial.animal', 'animal')
        .leftJoinAndSelect('animal.especie', 'especie')
        .leftJoinAndSelect('animal.razas', 'razas')
        .leftJoinAndSelect('animal.propietario', 'propietario')
        .leftJoinAndSelect('historial.veterinario', 'veterinario')
        .leftJoinAndSelect('historial.detalles', 'detalles')
        .where('veterinario.id = :veterinarioId', { veterinarioId })
        .orderBy('historial.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      if (!historial || historial.length === 0) {
        throw new NotFoundException(
          'No se encontraron historiales disponibles',
        );
      }
      const historial_plain = instanceToPlain(historial);
      return { historial: historial_plain, total };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<HistorialClinico> {
    const historial = await this.historialClinicoRepository.findOne({
      where: { id },
      relations: [
        'animal',
        'cita',
        'detalles',
        'detalles.subServicio',
        'detalles.insumos',
        'detalles.productos',
      ],
    });

    if (!historial) {
      throw new NotFoundException(
        `Historial clínico con ID ${id} no encontrado`,
      );
    }

    return historial;
  }

  async findByAnimal(animalId: string): Promise<HistorialClinico[]> {
    return await this.historialClinicoRepository.find({
      where: { animal: { id: animalId } },
      relations: ['animal', 'cita', 'detalles'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateHistorialClinicoDto: UpdateHistorialClinicoDto,
  ): Promise<HistorialClinico> {
    const historial = await this.findOne(id);

    const { animalId, citaId, ...updateData } = updateHistorialClinicoDto;

    if (animalId && animalId !== historial.animal.id) {
      const animal = await this.animalFincaRepository.findOne({
        where: { id: animalId },
      });
      if (!animal) {
        throw new NotFoundException(`Animal con ID ${animalId} no encontrado`);
      }
      historial.animal = animal;
    }

    if (citaId && citaId !== historial.cita?.id) {
      const cita = await this.citaRepository.findOne({
        where: { id: citaId },
      });
      if (!cita) {
        throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
      }
      historial.cita = cita;
    }

    Object.assign(historial, updateData);

    return await this.historialClinicoRepository.save(historial);
  }

  async remove(id: string): Promise<void> {
    const historial = await this.findOne(id);
    await this.historialClinicoRepository.remove(historial);
  }

  async findByCita(citaId: string): Promise<HistorialClinico | null> {
    return await this.historialClinicoRepository.findOne({
      where: { cita: { id: citaId } },
      relations: ['animal', 'cita', 'detalles'],
    });
  }
}
