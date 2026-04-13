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

  async findAll() {
    return await this.clientePermisoRepo.find({
      relations: ['cliente', 'permiso'],
    });
  }

  async findAllByPropietario(propietario: Cliente) {
    const propietarioId = propietario.id;

    const permisos = await this.clientePermisoRepo.find({
      where: { cliente: { id: propietarioId }, ver: true },
      relations: ['permiso'],
    });

    if (!permisos || permisos.length === 0) {
      throw new NotFoundException(
        `Hola ${propietario.nombre} en estos momentos no cuentas con permisos`,
      );
    }

    const permisosTransformados = permisos.map((item) => ({
      id: item.permiso.id,
      nombre: item.permiso.nombre,
      descripcion: item.permiso.descripcion,
      url: item.permiso.url,
      modulo: item.permiso.modulo,
      isActive: item.permiso.isActive,

      ver: item.ver,
      crear: item.crear,
      editar: item.editar,
      eliminar: item.eliminar,
    }));

    return permisosTransformados;
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
      relations: ['cliente', 'permiso'],
    });

    if (!clientePermiso)
      throw new NotFoundException('Cliente permiso no encontrado');

    Object.assign(clientePermiso, dto);
    await this.clientePermisoRepo.save(clientePermiso);

    const propietario = clientePermiso.cliente;

    const trabajadores = await this.clienteRepo.find({
      where: { propietario: { id: propietario.id } },
    });

    for (const trabajador of trabajadores) {
      const permisoTrabajador = await this.clientePermisoRepo.findOne({
        where: {
          cliente: { id: trabajador.id },
          permiso: { id: clientePermiso.permiso.id },
        },
      });

      if (permisoTrabajador) {
        permisoTrabajador.ver = dto.ver ?? permisoTrabajador.ver;
        permisoTrabajador.crear = dto.crear ?? permisoTrabajador.crear;
        permisoTrabajador.editar = dto.editar ?? permisoTrabajador.editar;
        permisoTrabajador.eliminar = dto.eliminar ?? permisoTrabajador.eliminar;

        await this.clientePermisoRepo.save(permisoTrabajador);
      }
    }

    return clientePermiso;
  }

  async remove(id: string) {
    const permiso = await this.clientePermisoRepo.findOne({
      where: { id },
      relations: ['cliente', 'permiso'],
    });

    if (!permiso) throw new NotFoundException('Cliente permiso no encontrado');

    const propietario = permiso.cliente;

    const trabajadores = await this.clienteRepo.find({
      where: { propietario: { id: propietario.id } },
    });

    for (const trabajador of trabajadores) {
      await this.clientePermisoRepo.delete({
        cliente: { id: trabajador.id },
        permiso: { id: permiso.permiso.id },
      });
    }

    await this.clientePermisoRepo.remove(permiso);

    return { message: 'Permiso eliminado correctamente en todos' };
  }
}
