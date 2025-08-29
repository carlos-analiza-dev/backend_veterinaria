import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
  ) {}
  async create(createServicioDto: CreateServicioDto) {
    const { nombre, descripcion } = createServicioDto;

    const servicio_nuevo = this.servicioRepo.create({
      descripcion,
      nombre,
    });

    await this.servicioRepo.save(servicio_nuevo);
    return 'Servicio Creado exitosamente';
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, offset, servicio = '' } = paginationDto;

    try {
      const queryBuilder = this.servicioRepo
        .createQueryBuilder('servicio')
        .leftJoinAndSelect('servicio.subServicios', 'subServicios')
        .leftJoinAndSelect('subServicios.preciosPorPais', 'preciosPorPais')
        .leftJoinAndSelect('preciosPorPais.pais', 'pais')
        .leftJoinAndSelect('subServicios.insumos', 'insumos')
        .where('servicio.isActive = :isActive', { isActive: true })
        .orderBy('servicio.createdAt', 'DESC');

      if (servicio && servicio.trim() !== '') {
        queryBuilder.andWhere(
          '(servicio.id = :servicioId OR servicio.nombre ILIKE :servicioNombre)',
          {
            servicioId: servicio,
            servicioNombre: `%${servicio}%`,
          },
        );
      }

      if (limit !== undefined) queryBuilder.take(limit);
      if (offset !== undefined) queryBuilder.skip(offset);

      const [servicios, total] = await queryBuilder.getManyAndCount();

      if (servicios.length === 0) {
        let errorMessage = 'No se encontraron servicios';

        if (servicio && servicio.trim() !== '') {
          errorMessage += ` con el filtro: ${servicio}`;
        }

        errorMessage += ' en este momento.';
        throw new NotFoundException(errorMessage);
      }

      return { servicios, total };
    } catch (error) {
      throw error;
    }
  }

  async findAllActivos() {
    try {
      const servicios = await this.servicioRepo.find({
        where: { isActive: true },
      });
      if (!servicios || servicios.length === 0) {
        throw new NotFoundException(
          'No se encontraron servicios en este momento.',
        );
      }
      return servicios;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const servicio = await this.servicioRepo.findOne({ where: { id } });
      if (!servicio)
        throw new BadRequestException('No se encontro el servicio.');
      return servicio;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateServicioDto: UpdateServicioDto) {
    try {
      const servicio = await this.servicioRepo.preload({
        id,
        ...updateServicioDto,
      });

      if (!servicio) {
        throw new NotFoundException(`No se encontró el servicio con id: ${id}`);
      }

      await this.servicioRepo.save(servicio);

      return {
        message: 'Servicio actualizado exitosamente',
        servicio,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ocurrió un error al actualizar el servicio',
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} servicio`;
  }
}
