import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRolesPermisosAgroDto } from './dto/create-roles-permisos-agro.dto';
import { UpdateRolesPermisosAgroDto } from './dto/update-roles-permisos-agro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesPermisosAgro } from './entities/roles-permisos-agro.entity';
import { In, Not, Repository } from 'typeorm';
import { RolesAgro } from 'src/roles-agro/entities/roles-agro.entity';
import { PermisosClientesAgro } from 'src/permisos_clientes_agro/entities/permisos_clientes_agro.entity';

@Injectable()
export class RolesPermisosAgroService {
  constructor(
    @InjectRepository(RolesPermisosAgro)
    private readonly rolesPermisosRepository: Repository<RolesPermisosAgro>,

    @InjectRepository(RolesAgro)
    private readonly rolesRepository: Repository<RolesAgro>,

    @InjectRepository(PermisosClientesAgro)
    private readonly permisosRepository: Repository<PermisosClientesAgro>,
  ) {}

  async create(createDto: CreateRolesPermisosAgroDto) {
    const { roleId, permisosIds } = createDto;

    const rol = await this.rolesRepository.findOne({
      where: { id: roleId },
    });

    if (!rol) {
      throw new NotFoundException('El rol no existe');
    }

    const permisos = await this.permisosRepository.find({
      where: {
        id: In(permisosIds),
      },
    });

    if (permisos.length !== permisosIds.length) {
      throw new NotFoundException('Uno o más permisos no existen');
    }

    const existentes = await this.rolesPermisosRepository.find({
      where: {
        rol: { id: roleId },
      },
    });

    const permisosExistentes = existentes.map((item) => item.permiso.id);

    const nuevos = permisos.filter(
      (permiso) => !permisosExistentes.includes(permiso.id),
    );

    if (!nuevos.length) {
      throw new ConflictException(
        'Todos los permisos ya están asignados al rol',
      );
    }

    const relaciones = nuevos.map((permiso) =>
      this.rolesPermisosRepository.create({
        rol,
        permiso,
      }),
    );

    return await this.rolesPermisosRepository.save(relaciones);
  }

  async findAll() {
    return await this.rolesPermisosRepository.find();
  }

  async findAllByRol(rolId: string) {
    try {
      const rolExiste = await this.rolesRepository.findOne({
        where: { id: rolId },
      });

      if (!rolExiste) {
        throw new NotFoundException('No se encontró el rol seleccionado');
      }

      const permisos = await this.permisosRepository.find({
        where: { roles: { rol: { id: rolId } } },
      });

      if (!permisos.length) {
        throw new NotFoundException(
          'No se encontraron permisos disponibles para este rol',
        );
      }

      return permisos.map((permiso) => ({
        ...permiso,
        url: permiso.url.replace('/agro-propietario', '/agro-empleados'),
      }));
    } catch (error) {
      throw error;
    }
  }

  async findAllNotRol(rolId: string) {
    const rolExiste = await this.rolesRepository.findOne({
      where: { id: rolId },
    });

    if (!rolExiste) {
      throw new NotFoundException('No se encontró el rol seleccionado');
    }

    const relaciones = await this.rolesPermisosRepository.find({
      where: {
        rol: {
          id: rolId,
        },
      },
      relations: {
        permiso: true,
      },
    });

    const permisosAsignadosIds = relaciones.map((r) => r.permiso.id);

    if (permisosAsignadosIds.length === 0) {
      return await this.permisosRepository.find();
    }

    return await this.permisosRepository.find({
      where: {
        id: Not(In(permisosAsignadosIds)),
      },
    });
  }

  async findOne(id: string) {
    const registro = await this.rolesPermisosRepository.findOne({
      where: { id },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    return registro;
  }

  async updatePermisosRol(roleId: string, dto: UpdateRolesPermisosAgroDto) {
    await this.rolesPermisosRepository.delete({
      rol: { id: roleId },
    });

    const relaciones = dto.permisosIds.map((permisoId) =>
      this.rolesPermisosRepository.create({
        rol: { id: roleId },
        permiso: { id: permisoId },
      }),
    );

    return this.rolesPermisosRepository.save(relaciones);
  }

  async remove(id: string) {
    const registro = await this.findOne(id);

    await this.rolesPermisosRepository.remove(registro);

    return {
      message: 'Permiso eliminado correctamente',
    };
  }
}
