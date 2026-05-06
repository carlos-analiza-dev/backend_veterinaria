import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMantenimientoEquipoDto } from './dto/create-mantenimiento_equipo.dto';
import { UpdateMantenimientoEquipoDto } from './dto/update-mantenimiento_equipo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MantenimientoEquipo } from './entities/mantenimiento_equipo.entity';
import { Repository } from 'typeorm';
import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { EstadoMaquinaria } from 'src/interfaces/maquinaria/maquinaria.enums';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class MantenimientoEquipoService {
  constructor(
    @InjectRepository(MantenimientoEquipo)
    private readonly mantenimientoRepo: Repository<MantenimientoEquipo>,
    @InjectRepository(EquipoMaquinaria)
    private readonly equiposRepo: Repository<EquipoMaquinaria>,
  ) {}

  async create(
    createMantenimientoEquipoDto: CreateMantenimientoEquipoDto,
    cliente: Cliente,
  ) {
    try {
      const propietarioId = getPropietarioId(cliente);

      const equipo = await this.equiposRepo
        .createQueryBuilder('equipo')
        .leftJoinAndSelect('equipo.finca', 'finca')
        .leftJoin('finca.propietario', 'propietario')
        .where('equipo.id = :equipoId', {
          equipoId: createMantenimientoEquipoDto.equipoId,
        })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .getOne();

      if (!equipo) {
        throw new NotFoundException(
          'Equipo no encontrado o no pertenece al cliente',
        );
      }

      if (equipo.estado === EstadoMaquinaria.MANTENIMIENTO) {
        throw new BadRequestException(
          'No se puede ingresar mantenimiento a este equipo porque se encuentra en mantenimiento',
        );
      }

      if (equipo.estado === EstadoMaquinaria.INACTIVO) {
        throw new BadRequestException(
          'No se puede ingresar mantenimiento a este equipo porque se encuentra en inactivo',
        );
      }

      const fechaInicio = new Date(createMantenimientoEquipoDto.fecha_inicio);
      const fechaFinal = new Date(createMantenimientoEquipoDto.fecha_final);

      if (fechaInicio >= fechaFinal) {
        throw new BadRequestException(
          'La fecha de inicio debe ser menor a la fecha final',
        );
      }

      const nuevoMantenimiento = this.mantenimientoRepo.create({
        ...createMantenimientoEquipoDto,
        fecha_inicio: fechaInicio,
        fecha_final: fechaFinal,
        equipo: equipo,
      });

      await this.mantenimientoRepo.save(nuevoMantenimiento);

      equipo.estado = EstadoMaquinaria.MANTENIMIENTO;
      await this.equiposRepo.save(equipo);

      return 'Mantenimiento registrado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll(cliente: Cliente, paginationDto: PaginationDto) {
    const propietarioId = getPropietarioId(cliente);

    const {
      limit = 10,
      offset = 0,
      tipoMantenimiento,
      fechaInicio,
      fechaFin,
      fincaId,
    } = paginationDto;

    const query = this.mantenimientoRepo
      .createQueryBuilder('mantenimiento')
      .leftJoinAndSelect('mantenimiento.equipo', 'equipo')
      .leftJoinAndSelect('equipo.finca', 'finca')
      .leftJoinAndSelect('finca.propietario', 'propietario')
      .where('propietario.id = :propietarioId', { propietarioId });

    if (tipoMantenimiento) {
      query.andWhere('mantenimiento.tipo = :tipoMantenimiento', {
        tipoMantenimiento,
      });
    }

    if (fechaInicio && fechaFin) {
      query.andWhere(
        'mantenimiento.fecha_inicio BETWEEN :fechaInicio AND :fechaFin',
        { fechaInicio, fechaFin },
      );
    }

    if (fincaId) {
      query.andWhere('finca.id = :fincaId', { fincaId });
    }

    const [data, total] = await query
      .orderBy('mantenimiento.fecha_inicio', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      total,
      limit,
      offset,
      mantenimientos: data.map(this.mapMantenimiento),
    };
  }

  async findOne(id: string, cliente: Cliente) {
    try {
      const propietarioId = getPropietarioId(cliente);

      const mantenimiento = await this.mantenimientoRepo
        .createQueryBuilder('mantenimiento')
        .leftJoinAndSelect('mantenimiento.equipo', 'equipo')
        .leftJoinAndSelect('equipo.finca', 'finca')
        .leftJoinAndSelect('finca.propietario', 'propietario')
        .where('mantenimiento.id = :id', { id })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .getOne();

      if (!mantenimiento) {
        throw new NotFoundException('Mantenimiento no encontrado');
      }

      return this.mapMantenimiento(mantenimiento);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateMantenimientoEquipoDto: UpdateMantenimientoEquipoDto,
    cliente: Cliente,
  ) {
    try {
      const propietarioId = getPropietarioId(cliente);

      const mantenimiento = await this.mantenimientoRepo
        .createQueryBuilder('mantenimiento')
        .leftJoinAndSelect('mantenimiento.equipo', 'equipo')
        .leftJoinAndSelect('equipo.finca', 'finca')
        .leftJoinAndSelect('finca.propietario', 'propietario')
        .where('mantenimiento.id = :id', { id })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .getOne();

      if (!mantenimiento) {
        throw new NotFoundException('Mantenimiento no encontrado');
      }

      const fechaInicio = updateMantenimientoEquipoDto.fecha_inicio
        ? new Date(updateMantenimientoEquipoDto.fecha_inicio)
        : mantenimiento.fecha_inicio;

      const fechaFinal = updateMantenimientoEquipoDto.fecha_final
        ? new Date(updateMantenimientoEquipoDto.fecha_final)
        : mantenimiento.fecha_final;

      if (fechaInicio >= fechaFinal) {
        throw new BadRequestException(
          'La fecha de inicio debe ser menor a la fecha final',
        );
      }

      if (
        updateMantenimientoEquipoDto.equipoId &&
        updateMantenimientoEquipoDto.equipoId !== mantenimiento.equipo.id
      ) {
        const nuevoEquipo = await this.equiposRepo
          .createQueryBuilder('equipo')
          .leftJoinAndSelect('equipo.finca', 'finca')
          .leftJoin('finca.propietario', 'propietario')
          .where('equipo.id = :equipoId', {
            equipoId: updateMantenimientoEquipoDto.equipoId,
          })
          .andWhere('propietario.id = :propietarioId', { propietarioId })
          .getOne();

        if (!nuevoEquipo) {
          throw new NotFoundException(
            'Equipo no encontrado o no pertenece al cliente',
          );
        }

        mantenimiento.equipo = nuevoEquipo;
      }

      Object.assign(mantenimiento, {
        ...updateMantenimientoEquipoDto,
        fecha_inicio: fechaInicio,
        fecha_final: fechaFinal,
      });

      await this.mantenimientoRepo.save(mantenimiento);

      const ahora = new Date();
      if (
        fechaFinal < ahora &&
        mantenimiento.equipo.estado === EstadoMaquinaria.MANTENIMIENTO
      ) {
        mantenimiento.equipo.estado = EstadoMaquinaria.ACTIVO;
        await this.equiposRepo.save(mantenimiento.equipo);
      }

      return {
        message: 'Mantenimiento actualizado exitosamente',
        mantenimiento: this.mapMantenimiento(mantenimiento),
      };
    } catch (error) {
      throw error;
    }
  }

  private mapMantenimiento = (m: MantenimientoEquipo) => {
    return {
      id: m.id,
      tipo: m.tipo,
      descripcion: m.descripcion,
      fecha_inicio: m.fecha_inicio,
      fecha_final: m.fecha_final,
      costo: m.costo,
      proximoMantenimiento: m.proximoMantenimiento,

      equipo: {
        id: m.equipo?.id,
        nombre: m.equipo?.nombre,
        codigoInterno: m.equipo?.codigoInterno,
        tipo: m.equipo?.tipo,
        marca: m.equipo?.marca,
        modelo: m.equipo?.modelo,
        estado: m.equipo?.estado,
      },

      finca: {
        id: m.equipo?.finca?.id,
        nombre: m.equipo?.finca?.nombre_finca,
        ubicacion: m.equipo?.finca?.ubicacion,
      },
    };
  };
}
