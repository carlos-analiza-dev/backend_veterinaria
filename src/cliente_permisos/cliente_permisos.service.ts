import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientePermiso } from './entities/cliente_permiso.entity';
import { CreateClientePermisoDto } from './dto/create-cliente_permiso.dto';
import { UpdateClientePermisoDto } from './dto/update-cliente_permiso.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PermisosCliente } from 'src/permisos_clientes/entities/permisos_cliente.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ClientePermisosService {
  constructor(
    @InjectRepository(ClientePermiso)
    private readonly clientePermisoRepo: Repository<ClientePermiso>,

    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,

    @InjectRepository(PermisosCliente)
    private readonly permisoRepo: Repository<PermisosCliente>,
  ) {}

  async create(dto: CreateClientePermisoDto) {
    try {
      const cliente = await this.clienteRepo.findOne({
        where: { id: dto.clienteId },
      });
      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      const permiso = await this.permisoRepo.findOne({
        where: { id: dto.permisoId },
      });
      if (!permiso) throw new NotFoundException('Permiso no encontrado');

      const existe = await this.clientePermisoRepo.findOne({
        where: {
          cliente: { id: dto.clienteId },
          permiso: { id: dto.permisoId },
        },
      });

      if (existe) {
        throw new BadRequestException(
          'Este permiso ya está asignado al cliente',
        );
      }

      const clientePermiso = this.clientePermisoRepo.create({
        cliente,
        permiso,
        ver: dto.ver,
        crear: dto.crear,
        editar: dto.editar,
        eliminar: dto.eliminar,
      });

      await this.clientePermisoRepo.save(clientePermiso);

      return 'Permiso asignado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return this.clientePermisoRepo.find({
      relations: ['cliente', 'permiso'],
    });
  }

  async findByCliente(clienteId: string) {
    return this.clientePermisoRepo.find({
      where: { cliente: { id: clienteId } },
      relations: ['permiso'],
    });
  }

  async update(id: string, dto: UpdateClientePermisoDto) {
    const clientePermiso = await this.clientePermisoRepo.findOne({
      where: { id },
    });

    if (!clientePermiso)
      throw new NotFoundException('Cliente permiso no encontrado');

    Object.assign(clientePermiso, dto);

    return await this.clientePermisoRepo.save(clientePermiso);
  }

  async remove(id: string) {
    const permiso = await this.clientePermisoRepo.findOne({
      where: { id },
    });

    if (!permiso) throw new NotFoundException('Cliente permiso no encontrado');

    await this.clientePermisoRepo.remove(permiso);
    return { message: 'Permiso eliminado correctamente' };
  }
}
