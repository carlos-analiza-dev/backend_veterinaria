import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermisosClientesAgroDto } from './dto/create-permisos_clientes_agro.dto';
import { UpdatePermisosClientesAgroDto } from './dto/update-permisos_clientes_agro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PermisosClientesAgro } from './entities/permisos_clientes_agro.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { TipoAgroservicio } from 'src/interfaces/paquetes/paquetes.enum';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';

@Injectable()
export class PermisosClientesAgroService {
  constructor(
    @InjectRepository(PermisosClientesAgro)
    private readonly permisosRepo: Repository<PermisosClientesAgro>,
    private readonly validationAgro: AgroservicioValidationService,
  ) {}

  async create(dto: CreatePermisosClientesAgroDto) {
    const tipoAgro =
      dto.tipo === TipoAgroservicio.AGRO_GESTION
        ? 'Agro Gestion'
        : 'Agro Light';
    const existe = await this.permisosRepo.findOne({
      where: [
        {
          tipo: dto.tipo,
          nombre: dto.nombre,
        },
        {
          tipo: dto.tipo,
          url: dto.url,
        },
      ],
    });

    if (existe) {
      if (
        existe.tipo === dto.tipo &&
        existe.nombre.toLowerCase() === dto.nombre.toLowerCase()
      ) {
        throw new BadRequestException(
          `Ya existe un permiso con el nombre "${dto.nombre}" para ${tipoAgro}`,
        );
      }

      if (existe.tipo === dto.tipo && existe.url === dto.url) {
        throw new BadRequestException(
          `Ya existe un permiso con la URL "${dto.url}" para ${tipoAgro}`,
        );
      }
    }

    const permiso = this.permisosRepo.create(dto);

    await this.permisosRepo.save(permiso);

    return 'Permiso creado exitosamente';
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, tipo_agro } = paginationDto;
    const [data, total] = await this.permisosRepo.findAndCount({
      where: { tipo: tipo_agro },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      data,
    };
  }

  async findPermisosActivos(cliente: Cliente, paginationDto: PaginationDto) {
    const propietarioId = cliente.id ?? '';
    const { tipo_agro } = paginationDto;

    try {
      let tieneAgroservicio = false;
      let tieneLogo = false;
      try {
        const agroservicio =
          await this.validationAgro.obtenerAgroservicio(propietarioId);
        tieneAgroservicio = !!agroservicio;
        tieneLogo = !!agroservicio?.logo;
      } catch (error) {
        tieneAgroservicio = false;
        tieneLogo = false;
      }

      const permisos = await this.permisosRepo.find({
        where: { isActive: true, tipo: tipo_agro },
      });

      if (!permisos || permisos.length === 0) {
        throw new NotFoundException('No se encontraron permisos disponibles');
      }

      if (!tieneAgroservicio || !tieneLogo) {
        const permisosCreacion = [
          '/agro-propietario/agro-servicios',
          '/agro-propietario/agro-perfil',
        ];

        const permisosFiltrados = permisos.filter((permiso) =>
          permisosCreacion.includes(permiso.url),
        );

        if (permisosFiltrados.length === 0) {
          throw new NotFoundException(
            'No se encontraron permisos disponibles para la creación del agroservicio',
          );
        }

        return permisosFiltrados;
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

  async update(id: string, dto: UpdatePermisosClientesAgroDto) {
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
