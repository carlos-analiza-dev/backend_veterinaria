import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { Sucursal } from './entities/sucursal.entity';
import { PaginationDto } from '../common/dto/pagination-common.dto';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async create(createSucursalDto: CreateSucursalDto): Promise<Sucursal> {
    try {
      // Verificar si ya existe una sucursal con el mismo nombre
      const existingSucursal = await this.sucursalRepository.findOne({
        where: { nombre: createSucursalDto.nombre },
      });

      if (existingSucursal) {
        throw new BadRequestException(
          `Ya existe una sucursal con el nombre: ${createSucursalDto.nombre}`,
        );
      }

      const sucursal = this.sucursalRepository.create(createSucursalDto);
      return await this.sucursalRepository.save(sucursal);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto || {};

    try {
      const [sucursales, total] = await this.sucursalRepository.findAndCount({
        relations: ['municipio', 'departamento'],
        where: { isActive: true },
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      });

      return {
        data: sucursales,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: string): Promise<Sucursal> {
    try {
      const sucursal = await this.sucursalRepository.findOne({
        where: { id },
        relations: ['municipio', 'departamento'],
      });

      if (!sucursal) {
        throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
      }

      return sucursal;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findByTipo(tipo: string, paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto || {};

    try {
      const [sucursales, total] = await this.sucursalRepository.findAndCount({
        where: {
          tipo: tipo as any,
          isActive: true,
        },
        relations: ['municipio', 'departamento'],
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      });

      return {
        data: sucursales,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findByMunicipio(municipioId: string, paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto || {};

    try {
      const [sucursales, total] = await this.sucursalRepository.findAndCount({
        where: {
          municipioId,
          isActive: true,
        },
        relations: ['municipio', 'departamento'],
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      });

      return {
        data: sucursales,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findByDepartamento(
    departamentoId: string,
    paginationDto?: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto || {};

    try {
      const [sucursales, total] = await this.sucursalRepository.findAndCount({
        where: {
          departamentoId,
          isActive: true,
        },
        relations: ['municipio', 'departamento'],
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      });

      return {
        data: sucursales,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(
    id: string,
    updateSucursalDto: UpdateSucursalDto,
  ): Promise<Sucursal> {
    try {
      const sucursal = await this.findOne(id);

      // Si se está actualizando el nombre, verificar que no exista otra sucursal con ese nombre
      if (
        updateSucursalDto.nombre &&
        updateSucursalDto.nombre !== sucursal.nombre
      ) {
        const existingSucursal = await this.sucursalRepository.findOne({
          where: { nombre: updateSucursalDto.nombre },
        });

        if (existingSucursal) {
          throw new BadRequestException(
            `Ya existe una sucursal con el nombre: ${updateSucursalDto.nombre}`,
          );
        }
      }

      Object.assign(sucursal, updateSucursalDto);
      return await this.sucursalRepository.save(sucursal);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const sucursal = await this.findOne(id);

      // Soft delete - solo marcar como inactivo
      sucursal.isActive = false;
      await this.sucursalRepository.save(sucursal);

      return { message: `Sucursal ${sucursal.nombre} ha sido desactivada` };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // Método para obtener estadísticas
  async getStats() {
    try {
      const [
        totalSucursales,
        totalBodegas,
        totalCasasMatriz,
        totalSucursalesNormales,
      ] = await Promise.all([
        this.sucursalRepository.count({ where: { isActive: true } }),
        this.sucursalRepository.count({
          where: { tipo: 'bodega' as any, isActive: true },
        }),
        this.sucursalRepository.count({
          where: { tipo: 'casa_matriz' as any, isActive: true },
        }),
        this.sucursalRepository.count({
          where: { tipo: 'sucursal' as any, isActive: true },
        }),
      ]);

      return {
        total: totalSucursales,
        porTipo: {
          bodegas: totalBodegas,
          casasMatriz: totalCasasMatriz,
          sucursales: totalSucursalesNormales,
        },
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    throw new InternalServerErrorException(
      'Error inesperado, revise los logs del servidor',
    );
  }
}
