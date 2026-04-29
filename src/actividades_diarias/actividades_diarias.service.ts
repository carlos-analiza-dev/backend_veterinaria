import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateActividadesDiariaDto } from './dto/create-actividades_diaria.dto';
import { UpdateActividadesDiariaDto } from './dto/update-actividades_diaria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Repository, Not } from 'typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { ActividadesDiaria } from './entities/actividades_diaria.entity';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import {
  EstadoActividad,
  FrecuenciaActividad,
  TipoActividad,
} from 'src/interfaces/actividades/actividaes.enums';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { MailService } from 'src/mail/mail.service';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { ClienteFincaTrabajador } from 'src/cliente_finca_trabajador/entities/cliente_finca_trabajador.entity';

@Injectable()
export class ActividadesDiariasService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(FincasGanadero)
    private readonly fincaRepo: Repository<FincasGanadero>,
    @InjectRepository(ActividadesDiaria)
    private readonly actividadesRepo: Repository<ActividadesDiaria>,
    @InjectRepository(ClienteFincaTrabajador)
    private readonly clienteFincaTrabajadorRepo: Repository<ClienteFincaTrabajador>,
    private readonly mailService: MailService,
  ) {}
  async create(
    propietario: Cliente,
    createActividadesDiariaDto: CreateActividadesDiariaDto,
  ) {
    const propietarioId = getPropietarioId(propietario);
    try {
      const propietarioExists = await this.clienteRepo.findOne({
        where: { id: propietarioId },
      });

      if (!propietarioExists) {
        throw new NotFoundException('Propietario no encontrado');
      }

      const trabajador = await this.clienteRepo.findOne({
        where: { id: createActividadesDiariaDto.trabajadorId },
      });

      if (!trabajador) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      if (trabajador.propietarioId !== propietarioId) {
        throw new BadRequestException(
          'El trabajador no pertenece a este propietario',
        );
      }

      let finca = null;
      if (createActividadesDiariaDto.fincaId) {
        finca = await this.fincaRepo.findOne({
          where: { id: createActividadesDiariaDto.fincaId },
          relations: ['propietario'],
        });

        if (!finca) {
          throw new NotFoundException('Finca no encontrada');
        }

        if (finca.propietario.id !== propietarioId) {
          throw new BadRequestException(
            'La finca no pertenece a este propietario',
          );
        }
      }

      if (createActividadesDiariaDto.fincaId) {
        const asignacion = await this.clienteFincaTrabajadorRepo.findOne({
          where: {
            trabajador: { id: trabajador.id },
            finca: { id: finca.id },
          },
        });

        if (!asignacion) {
          throw new BadRequestException(
            'El trabajador no está asignado a esta finca',
          );
        }
      }

      const actividad = this.actividadesRepo.create({
        trabajadorId: createActividadesDiariaDto.trabajadorId,
        propietarioId: propietarioId,
        fincaId: createActividadesDiariaDto.fincaId || null,
        fecha: createActividadesDiariaDto.fecha,
        tipo: createActividadesDiariaDto.tipo,
        estado: createActividadesDiariaDto.estado || EstadoActividad.PENDIENTE,
        frecuencia: createActividadesDiariaDto.frecuencia,
        descripcion: createActividadesDiariaDto.descripcion,
        completada: createActividadesDiariaDto.completada || false,
      });

      await this.actividadesRepo.save(actividad);
      const tituloActividad =
        TipoActividad[createActividadesDiariaDto.tipo] ||
        createActividadesDiariaDto.tipo;

      await this.actividadesRepo.save(actividad);
      await this.mailService.sendNuevaActividadTrabajador(
        trabajador.email,
        trabajador.nombre,
        propietarioExists.nombre,
        finca?.nombre_finca || 'No especificada',
        tituloActividad,
        TipoActividad[createActividadesDiariaDto.tipo] ||
          createActividadesDiariaDto.tipo,
        createActividadesDiariaDto.fecha,
        FrecuenciaActividad[createActividadesDiariaDto.frecuencia] ||
          createActividadesDiariaDto.frecuencia ||
          'Única',
        createActividadesDiariaDto.descripcion,
      );

      return 'Actividad Guardada Con Exito';
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(`Error al crear la actividad`);
    }
  }

  async findAll(cliente: Cliente, paginationDto: PaginationDto) {
    const propietarioId = getPropietarioId(cliente);

    const {
      limit = 10,
      offset = 0,
      trabajadorId,
      estado,
      fincaId,
      fechaInicio,
      fechaFin,
    } = paginationDto;

    const query = this.actividadesRepo
      .createQueryBuilder('actividad')
      .leftJoinAndSelect('actividad.trabajador', 'trabajador')
      .leftJoinAndSelect('actividad.propietario', 'propietario')
      .leftJoinAndSelect('actividad.finca', 'finca')
      .leftJoinAndSelect('actividad.fotos', 'fotos')
      .where('actividad.propietarioId = :propietarioId', {
        propietarioId,
      });

    if (cliente.rol === TipoCliente.TRABAJADOR) {
      query.andWhere('actividad.trabajadorId = :clienteId', {
        clienteId: cliente.id,
      });
    }

    if (cliente.rol === TipoCliente.SUPERVISOR) {
      query
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('asignacion.fincaId')
            .from(ClienteFincaTrabajador, 'asignacion')
            .where('asignacion.trabajadorId = :clienteId')
            .getQuery();

          return `
        (
          actividad.fincaId IN ${subQuery}
          OR actividad.trabajadorId = :clienteId
        )
      `;
        })
        .setParameter('clienteId', cliente.id);
    }

    if (trabajadorId) {
      query.andWhere('actividad.trabajadorId = :trabajadorId', {
        trabajadorId,
      });
    }

    if (estado) {
      query.andWhere('actividad.estado = :estado', {
        estado,
      });
    }

    if (fincaId) {
      query.andWhere('actividad.fincaId = :fincaId', {
        fincaId,
      });
    }

    if (fechaInicio && fechaFin) {
      query.andWhere('actividad.fecha BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin,
      });
    }

    if (fechaInicio && !fechaFin) {
      query.andWhere('actividad.fecha >= :fechaInicio', {
        fechaInicio,
      });
    }

    if (fechaFin && !fechaInicio) {
      query.andWhere('actividad.fecha <= :fechaFin', {
        fechaFin,
      });
    }

    const [data, total] = await query
      .orderBy('actividad.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const mappedData = data.map((actividad) => this.mappingData(actividad));

    return {
      actividades: mappedData,
      total,
      limit,
      offset,
    };
  }
  async findOne(id: string) {
    try {
      const actividad = await this.actividadesRepo.findOne({ where: { id } });
      if (!actividad)
        throw new NotFoundException('No se encontro la actividad seleccionada');
      return actividad;
    } catch (error) {
      throw error;
    }
  }

  async update(
    cliente: Cliente,
    id: string,
    updateActividadesDiariaDto: UpdateActividadesDiariaDto,
  ) {
    const actividad = await this.actividadesRepo.findOne({
      where: { id },
      relations: ['propietario', 'trabajador'],
    });

    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada');
    }

    if (cliente.rol !== TipoCliente.PROPIETARIO) {
      const allowedFields = ['estado', 'completada', 'descripcion'];
      const updatedFields = Object.keys(updateActividadesDiariaDto);

      const hasInvalidFields = updatedFields.some(
        (field) => !allowedFields.includes(field),
      );

      if (hasInvalidFields) {
        throw new ForbiddenException(
          'Los trabajadores solo pueden actualizar estado, completada y descripción',
        );
      }
    }

    if (updateActividadesDiariaDto.estado === EstadoActividad.COMPLETADA) {
      updateActividadesDiariaDto.completada = true;
    }

    if (
      updateActividadesDiariaDto.completada === true &&
      !actividad.completada
    ) {
      updateActividadesDiariaDto.estado = EstadoActividad.COMPLETADA;

      try {
        await this.mailService.sendActividadCompletada(
          actividad.propietario.email,
          actividad.propietario.nombre,
          actividad.trabajador.nombre,
          actividad.tipo,
          actividad.fecha,
        );
      } catch (emailError) {
        console.error(
          'Error al enviar notificación de completado:',
          emailError,
        );
      }
    }

    Object.assign(actividad, updateActividadesDiariaDto);
    const updatedActividad = await this.actividadesRepo.save(actividad);

    return {
      message: 'Actividad actualizada con éxito',
      actividad: this.mappingData(updatedActividad),
    };
  }

  async remove(cliente: Cliente, id: string) {
    const actividad = await this.actividadesRepo.findOne({
      where: { id },
      relations: ['propietario'],
    });

    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada');
    }

    if (cliente.rol !== TipoCliente.PROPIETARIO) {
      throw new ForbiddenException(
        'Solo los propietarios pueden eliminar actividades',
      );
    }

    const propietarioId = getPropietarioId(cliente);
    if (actividad.propietarioId !== propietarioId) {
      throw new ForbiddenException(
        'No tiene permisos para eliminar esta actividad',
      );
    }

    await this.actividadesRepo.remove(actividad);

    return {
      message: 'Actividad eliminada con éxito',
    };
  }

  private mappingData(actividad: ActividadesDiaria) {
    return {
      id: actividad.id,
      fecha: actividad.fecha,
      tipo: actividad.tipo,
      estado: actividad.estado,
      frecuencia: actividad.frecuencia,
      descripcion: actividad.descripcion,
      completada: actividad.completada,
      createdAt: actividad.createdAt,

      propietario: actividad.propietario
        ? {
            id: actividad.propietario.id,
            nombre: actividad.propietario.nombre,
            telefono: actividad.propietario.telefono,
          }
        : null,

      finca: actividad.finca
        ? {
            id: actividad.finca.id,
            nombre_finca: actividad.finca.nombre_finca,
            ubicacion: actividad.finca.ubicacion,
          }
        : null,

      trabajador: actividad.trabajador
        ? {
            id: actividad.trabajador.id,
            nombre: actividad.trabajador.nombre,
          }
        : null,

      fotos: actividad.fotos ?? [],
    };
  }

  private getTipoActividadTexto(tipo: TipoActividad): string {
    const tipos = {
      [TipoActividad.SIEMBRA]: '🌱 Siembra',
      [TipoActividad.REPARACION]: '🔧 Reparación',
      [TipoActividad.LIMPIEZA]: '🧹 Limpieza',
      [TipoActividad.MANTENIMIENTO]: '⚙️ Mantenimiento',
      [TipoActividad.ALIMENTACION]: '🍖 Alimentación',
      [TipoActividad.VACUNACION]: '💉 Vacunación',
      [TipoActividad.COSECHA]: '🌾 Cosecha',
      [TipoActividad.OTRO]: '📋 Otro',
    };
    return tipos[tipo] || tipo;
  }
}
