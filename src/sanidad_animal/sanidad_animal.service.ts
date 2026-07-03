import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSanidadAnimalDto } from './dto/create-sanidad_animal.dto';
import { UpdateSanidadAnimalDto } from './dto/update-sanidad_animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SanidadAnimal } from './entities/sanidad_animal.entity';
import { Repository } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class SanidadAnimalService {
  constructor(
    @InjectRepository(SanidadAnimal)
    private readonly sanidadRepo: Repository<SanidadAnimal>,
    @InjectRepository(AnimalFinca)
    private readonly animalRepo: Repository<AnimalFinca>,
  ) {}

  async create(
    createSanidadAnimalDto: CreateSanidadAnimalDto,
    cliente: Cliente,
  ) {
    const propietarioId = getPropietarioId(cliente);
    try {
      const animal = await this.animalRepo.findOne({
        where: { id: createSanidadAnimalDto.animalId },
      });

      if (!animal) {
        throw new NotFoundException(
          `No se encontró un animal con el ID: ${createSanidadAnimalDto.animalId}`,
        );
      }

      const sanidad = this.sanidadRepo.create({
        ...createSanidadAnimalDto,
        animal: animal,
        propietarioId,
      });

      await this.sanidadRepo.save(sanidad);

      return 'Ingreso de sanidad exitoso';
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el registro de sanidad`);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    cliente: Cliente,
  ): Promise<{
    sanidad: SanidadAnimal[];
    total: number;
  }> {
    const { especie, tipo_servicio, limit = 10, offset = 0 } = paginationDto;
    const propietarioId = getPropietarioId(cliente);

    try {
      const queryBuilder = this.sanidadRepo
        .createQueryBuilder('sanidad')
        .leftJoinAndSelect('sanidad.animal', 'animal')
        .leftJoinAndSelect('animal.especie', 'especie')
        .where('sanidad.propietarioId = :propietarioId', { propietarioId });

      if (especie) {
        queryBuilder.andWhere('LOWER(especie.nombre) = LOWER(:especie)', {
          especie,
        });
      }

      if (tipo_servicio) {
        queryBuilder.andWhere('sanidad.tipo_servicio = :tipo_servicio', {
          tipo_servicio,
        });
      }

      const total = await queryBuilder.getCount();

      const data = await queryBuilder
        .orderBy('sanidad.fecha_evento', 'DESC')
        .take(limit)
        .skip(offset)
        .getMany();

      return {
        sanidad: data,
        total,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener los registros de sanidad`,
      );
    }
  }

  async findAllByAnimal(animalId: string): Promise<SanidadAnimal[]> {
    try {
      const animal = await this.animalRepo.findOne({
        where: { id: animalId },
      });

      if (!animal) {
        throw new NotFoundException(
          `No se encontró un animal con el ID: ${animalId}`,
        );
      }

      return await this.sanidadRepo.find({
        where: { animalId },
        order: {
          fecha_evento: 'DESC',
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener los registros de sanidad del animal`,
      );
    }
  }

  async findOne(id: string): Promise<SanidadAnimal> {
    try {
      const sanidad = await this.sanidadRepo.findOne({
        where: { id },
      });

      if (!sanidad) {
        throw new NotFoundException(
          `No se encontró un registro de sanidad con el ID: ${id}`,
        );
      }

      return sanidad;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener el registro de sanidad`);
    }
  }

  async update(
    id: string,
    updateSanidadAnimalDto: UpdateSanidadAnimalDto,
  ): Promise<SanidadAnimal> {
    try {
      const existingSanidad = await this.findOne(id);

      if (updateSanidadAnimalDto.animalId) {
        const animal = await this.animalRepo.findOne({
          where: { id: updateSanidadAnimalDto.animalId },
        });

        if (!animal) {
          throw new NotFoundException(
            `No se encontró un animal con el ID: ${updateSanidadAnimalDto.animalId}`,
          );
        }
      }

      await this.sanidadRepo.update(id, updateSanidadAnimalDto);

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar el registro de sanidad`,
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const sanidad = await this.findOne(id);

      await this.sanidadRepo.remove(sanidad);

      return {
        message: `Registro de sanidad con ID ${id} eliminado correctamente`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el registro de sanidad`);
    }
  }

  async getEstadisticasByAnimal(animalId: string): Promise<any> {
    try {
      const registros = await this.findAllByAnimal(animalId);

      const totalRegistros = registros.length;
      const totalCostoReal = registros.reduce(
        (sum, r) => sum + (r.costo_real || 0),
        0,
      );
      const tiposServicio = [...new Set(registros.map((r) => r.tipo_servicio))];

      return {
        animalId,
        totalRegistros,
        totalCostoReal,
        tiposServicio,
        ultimoRegistro: registros[0] || null,
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas`);
    }
  }

  async findByTipoServicio(tipoServicio: string): Promise<SanidadAnimal[]> {
    try {
      return await this.sanidadRepo.find({
        where: { tipo_servicio: tipoServicio },
        order: {
          fecha_evento: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al buscar registros por tipo de servicio`,
      );
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<SanidadAnimal[]> {
    try {
      return await this.sanidadRepo
        .createQueryBuilder('sanidad')
        .where('sanidad.fecha_evento BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .orderBy('sanidad.fecha_evento', 'DESC')
        .getMany();
    } catch (error) {
      throw new BadRequestException(
        `Error al buscar registros por rango de fechas`,
      );
    }
  }
}
