import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PermisosCliente } from './entities/permisos_cliente.entity';
import { CreatePermisosClienteDto } from './dto/create-permisos_cliente.dto';
import { UpdatePermisosClienteDto } from './dto/update-permisos_cliente.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class PermisosClientesService {
  constructor(
    @InjectRepository(PermisosCliente)
    private readonly permisosRepo: Repository<PermisosCliente>,
  ) {}

  async create(dto: CreatePermisosClienteDto) {
    const permiso = this.permisosRepo.create(dto);
    await this.permisosRepo.save(permiso);
    return 'Permiso creado exitosamente';
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const [data, total] = await this.permisosRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      data,
    };
  }

  async findPermisosActivos() {
    try {
      const permisos = await this.permisosRepo.find({
        where: { isActive: true },
      });
      if (!permisos || permisos.length === 0) {
        throw new NotFoundException('No se encontraron permisos disponibles');
      }
      return permisos;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const permiso = await this.permisosRepo.findOne({
      where: { id },
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con id ${id} no encontrado`);
    }

    return permiso;
  }

  async update(id: string, dto: UpdatePermisosClienteDto) {
    const permiso = await this.findOne(id);

    const permisoActualizado = Object.assign(permiso, dto);

    return await this.permisosRepo.save(permisoActualizado);
  }

  async remove(id: string) {
    const permiso = await this.findOne(id);

    await this.permisosRepo.remove(permiso);

    return { message: 'Permiso eliminado correctamente' };
  }
}
