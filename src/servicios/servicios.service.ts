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
import { Pai } from 'src/pais/entities/pai.entity';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
  ) {}
  async create(createServicioDto: CreateServicioDto) {
    const { nombre, descripcion, paisId } = createServicioDto;

    const pais_existe = await this.paisRepo.findOne({ where: { id: paisId } });
    if (!pais_existe)
      throw new NotFoundException('El pais seleccionado no existe');

    const servicio_nuevo = this.servicioRepo.create({
      descripcion,
      nombre,
      pais: pais_existe,
    });

    await this.servicioRepo.save(servicio_nuevo);
    return 'Servicio Creado exitosamente';
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const paisId = user.pais.id;
    const { limit, offset, servicio = '' } = paginationDto;

    try {
      const queryBuilder = this.servicioRepo
        .createQueryBuilder('servicio')
        .leftJoinAndSelect('servicio.subServicios', 'subServicios')
        .leftJoinAndSelect('subServicios.preciosPorPais', 'preciosPorPais')
        .leftJoinAndSelect('preciosPorPais.pais', 'pais')
        .leftJoinAndSelect('subServicios.insumos', 'servicioInsumos')
        .leftJoinAndSelect('servicioInsumos.insumo', 'insumo')
        .where('servicio.pais_id = :paisId', { paisId });

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

  async findAllActivos(user: User) {
    const paisId = user.pais.id;
    try {
      const pais_existe = await this.paisRepo.findOne({
        where: { id: paisId },
      });
      if (!pais_existe)
        throw new NotFoundException('No se encontro el pais seleccionado');
      const servicios = await this.servicioRepo.find({
        where: { isActive: true, pais: { id: paisId } },
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
