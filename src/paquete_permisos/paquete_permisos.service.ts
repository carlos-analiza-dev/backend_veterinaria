import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaquetePermisoDto } from './dto/create-paquete_permiso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaquetePermiso } from './entities/paquete_permiso.entity';
import { Repository } from 'typeorm';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { PermisosCliente } from 'src/permisos_clientes/entities/permisos_cliente.entity';
import { User } from 'src/auth/entities/auth.entity';
import { UpdatePaquetePermisoDto } from './dto/update-permisos.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class PaquetePermisosService {
  constructor(
    @InjectRepository(PaquetePermiso)
    private paquetePermisoRepository: Repository<PaquetePermiso>,
    @InjectRepository(Paquete)
    private paqueteRepository: Repository<Paquete>,
    @InjectRepository(PermisosCliente)
    private permisoRepository: Repository<PermisosCliente>,
  ) {}
  async create(
    createPaquetePermisoDto: CreatePaquetePermisoDto,
  ): Promise<PaquetePermiso[]> {
    try {
      const { paqueteId, permisosIds } = createPaquetePermisoDto;

      const paquete = await this.paqueteRepository.findOne({
        where: { id: paqueteId },
      });

      if (!paquete) {
        throw new NotFoundException(
          `Paquete con ID "${paqueteId}" no encontrado`,
        );
      }

      const permisos = await this.permisoRepository.find({
        where: permisosIds.map((id) => ({ id })),
      });

      if (permisos.length !== permisosIds.length) {
        throw new BadRequestException('Uno o varios permisos no existen');
      }

      const relacionesExistentes = await this.paquetePermisoRepository.find({
        where: permisosIds.map((permisoId) => ({
          paquete: { id: paqueteId },
          permiso: { id: permisoId },
        })),
        relations: ['permiso'],
      });

      const permisosExistentesIds = relacionesExistentes.map(
        (relacion) => relacion.permiso.id,
      );

      const permisosNuevos = permisos.filter(
        (permiso) => !permisosExistentesIds.includes(permiso.id),
      );

      if (permisosNuevos.length === 0) {
        throw new BadRequestException(
          'Todos los permisos ya están asignados al paquete',
        );
      }

      const nuevasRelaciones = permisosNuevos.map((permiso) =>
        this.paquetePermisoRepository.create({
          paquete,
          permiso,
        }),
      );

      return await this.paquetePermisoRepository.save(nuevasRelaciones);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('Error al asignar permisos al paquete');
    }
  }

  async findAll(): Promise<PaquetePermiso[]> {
    return await this.paquetePermisoRepository.find({
      relations: ['paquete', 'permiso'],
    });
  }

  async findByPaquete(id: string, user: User): Promise<PaquetePermiso[]> {
    const paisId = user.pais.id ?? '';

    return await this.paquetePermisoRepository.find({
      where: {
        paquete: {
          id,
          preciosPorPais: {
            pais: {
              id: paisId,
            },
          },
        },
      },
      relations: ['permiso'],
    });
  }

  async findByPaqueteCliente(
    id: string,
    cliente: Cliente,
  ): Promise<PaquetePermiso[]> {
    const paisId = cliente.pais.id ?? '';

    return await this.paquetePermisoRepository.find({
      where: {
        paquete: {
          id,
          preciosPorPais: {
            pais: {
              id: paisId,
            },
          },
        },
      },
      relations: ['permiso'],
    });
  }

  async findByPaquetesCliente(id: string, cliente: Cliente) {
    const paisId = cliente.pais.id ?? '';

    const paquetePermisos = await this.paquetePermisoRepository.find({
      where: {
        paquete: {
          id,
          preciosPorPais: {
            pais: {
              id: paisId,
            },
          },
        },
      },
      relations: ['permiso'],
    });

    return paquetePermisos.map((item) => item.permiso);
  }

  async findOne(id: string): Promise<PaquetePermiso> {
    const paquetePermiso = await this.paquetePermisoRepository.findOne({
      where: { id },
      relations: ['paquete', 'permiso'],
    });

    if (!paquetePermiso) {
      throw new NotFoundException(
        `Relación paquete-permiso con ID "${id}" no encontrada`,
      );
    }

    return paquetePermiso;
  }

  async update(id: string, updatePaquetePermisoDto: UpdatePaquetePermisoDto) {
    const paquetePermiso = await this.paquetePermisoRepository.findOne({
      where: { id },
      relations: ['paquete', 'permiso'],
    });

    if (!paquetePermiso) {
      throw new NotFoundException('Relación paquete-permiso no encontrada');
    }

    Object.assign(paquetePermiso, updatePaquetePermisoDto);

    return await this.paquetePermisoRepository.save(paquetePermiso);
  }

  async remove(id: string): Promise<{ message: string }> {
    const paquetePermiso = await this.paquetePermisoRepository.findOne({
      where: { id },
      relations: ['paquete', 'permiso'],
    });

    if (!paquetePermiso) {
      throw new NotFoundException(
        `Relación paquete-permiso con ID "${id}" no encontrada`,
      );
    }

    await this.paquetePermisoRepository.remove(paquetePermiso);
    return {
      message: `Permiso "${paquetePermiso.permiso.nombre}" eliminado correctamente del paquete "${paquetePermiso.paquete.nombre}"`,
    };
  }
}
