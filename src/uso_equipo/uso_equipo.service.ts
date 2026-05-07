import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateUsoEquipoDto } from './dto/create-uso_equipo.dto';
import { UpdateUsoEquipoDto } from './dto/update-uso_equipo.dto';
import { UsoEquipo } from './entities/uso_equipo.entity';
import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';
import { ActividadesDiaria } from 'src/actividades_diarias/entities/actividades_diaria.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class UsoEquipoService {
  constructor(
    @InjectRepository(UsoEquipo)
    private readonly usoEquipoRepo: Repository<UsoEquipo>,
    @InjectRepository(EquipoMaquinaria)
    private readonly equipoRepo: Repository<EquipoMaquinaria>,
    @InjectRepository(ActividadesDiaria)
    private readonly actividadRepo: Repository<ActividadesDiaria>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async create(createUsoEquipoDto: CreateUsoEquipoDto, cliente: Cliente) {
    try {
      const propietarioId = getPropietarioId(cliente);
      const equipo = await this.equipoRepo
        .createQueryBuilder('equipo')
        .leftJoinAndSelect('equipo.finca', 'finca')
        .leftJoin('finca.propietario', 'propietario')
        .where('equipo.id = :equipoId', {
          equipoId: createUsoEquipoDto.equipoId,
        })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .getOne();

      if (!equipo) {
        throw new NotFoundException(
          'Equipo no encontrado o no pertenece al cliente',
        );
      }
      let actividad = null;
      if (createUsoEquipoDto.actividadId) {
        actividad = await this.actividadRepo.findOne({
          where: { id: createUsoEquipoDto.actividadId },
        });
        if (!actividad) {
          throw new NotFoundException('Actividad no encontrada');
        }
      }

      let operador = null;
      if (createUsoEquipoDto.operadorId) {
        operador = await this.clienteRepo.findOne({
          where: { id: createUsoEquipoDto.operadorId },
        });
        if (!operador) {
          throw new NotFoundException('Operador no encontrado');
        }
      }

      const fechaInicio = new Date(createUsoEquipoDto.fechaInicio);
      const fechaFin = new Date(createUsoEquipoDto.fechaFin);

      if (fechaInicio >= fechaFin) {
        throw new BadRequestException(
          'La fecha de inicio debe ser menor a la fecha de fin',
        );
      }

      const usoExistente = await this.usoEquipoRepo
        .createQueryBuilder('uso')
        .where('uso.equipoId = :equipoId', {
          equipoId: equipo.id,
        })
        .andWhere(
          `
      (
        :fechaInicio < "uso"."fechaFin"
        AND
        :fechaFin > "uso"."fechaInicio"
      )
    `,
          {
            fechaInicio,
            fechaFin,
          },
        )
        .getOne();

      if (usoExistente) {
        throw new BadRequestException(
          'El equipo ya está en uso en ese período de tiempo',
        );
      }

      const nuevoUso = this.usoEquipoRepo.create({
        equipo,
        actividad,
        operador,
        fechaInicio,
        fechaFin,
        horasTrabajadas: createUsoEquipoDto.horasTrabajadas,
      });

      await this.usoEquipoRepo.save(nuevoUso);

      return {
        message: 'Uso de equipo registrado exitosamente',
        usoEquipo: this.mapUsoEquipo(nuevoUso),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(cliente: Cliente, paginationDto: PaginationDto) {
    try {
      const propietarioId = getPropietarioId(cliente);
      const {
        limit = 10,
        offset = 0,
        equipoId,
        actividadId,
        operadorId,
      } = paginationDto;

      const query = this.usoEquipoRepo
        .createQueryBuilder('uso')
        .leftJoinAndSelect('uso.equipo', 'equipo')
        .leftJoinAndSelect('equipo.finca', 'finca')
        .leftJoinAndSelect('finca.propietario', 'propietario')
        .leftJoinAndSelect('uso.actividad', 'actividad')
        .leftJoinAndSelect('uso.operador', 'operador')
        .where('propietario.id = :propietarioId', { propietarioId });

      if (equipoId) {
        query.andWhere('equipo.id = :equipoId', { equipoId });
      }

      if (actividadId) {
        query.andWhere('actividad.id = :actividadId', { actividadId });
      }

      if (operadorId) {
        query.andWhere('operador.id = :operadorId', { operadorId });
      }

      const [data, total] = await query
        .orderBy('uso.fechaInicio', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return {
        total,
        limit,
        offset,
        usosEquipo: data.map(this.mapUsoEquipo),
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string, cliente: Cliente) {
    try {
      const propietarioId = getPropietarioId(cliente);

      const usoEquipo = await this.usoEquipoRepo
        .createQueryBuilder('uso')
        .leftJoinAndSelect('uso.equipo', 'equipo')
        .leftJoinAndSelect('equipo.finca', 'finca')
        .leftJoinAndSelect('finca.propietario', 'propietario')
        .leftJoinAndSelect('uso.actividad', 'actividad')
        .leftJoinAndSelect('uso.operador', 'operador')
        .where('uso.id = :id', { id })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .getOne();

      if (!usoEquipo) {
        throw new NotFoundException('Registro de uso de equipo no encontrado');
      }

      return this.mapUsoEquipo(usoEquipo);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateUsoEquipoDto: UpdateUsoEquipoDto,
    cliente: Cliente,
  ) {
    try {
      const propietarioId = getPropietarioId(cliente);

      const usoEquipo = await this.usoEquipoRepo
        .createQueryBuilder('uso')
        .leftJoinAndSelect('uso.equipo', 'equipo')
        .leftJoinAndSelect('equipo.finca', 'finca')
        .leftJoinAndSelect('finca.propietario', 'propietario')
        .where('uso.id = :id', { id })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .getOne();

      if (!usoEquipo) {
        throw new NotFoundException('Registro de uso de equipo no encontrado');
      }

      if (
        updateUsoEquipoDto.equipoId &&
        updateUsoEquipoDto.equipoId !== usoEquipo.equipo.id
      ) {
        const nuevoEquipo = await this.equipoRepo
          .createQueryBuilder('equipo')
          .leftJoinAndSelect('equipo.finca', 'finca')
          .leftJoin('finca.propietario', 'propietario')
          .where('equipo.id = :equipoId', {
            equipoId: updateUsoEquipoDto.equipoId,
          })
          .andWhere('propietario.id = :propietarioId', { propietarioId })
          .getOne();

        if (!nuevoEquipo) {
          throw new NotFoundException(
            'Equipo no encontrado o no pertenece al cliente',
          );
        }
        usoEquipo.equipo = nuevoEquipo;
      }

      if (updateUsoEquipoDto.actividadId !== undefined) {
        if (updateUsoEquipoDto.actividadId) {
          const actividad = await this.actividadRepo.findOne({
            where: { id: updateUsoEquipoDto.actividadId },
          });
          if (!actividad) {
            throw new NotFoundException('Actividad no encontrada');
          }
          usoEquipo.actividad = actividad;
        } else {
          usoEquipo.actividad = null;
        }
      }

      if (updateUsoEquipoDto.operadorId !== undefined) {
        if (updateUsoEquipoDto.operadorId) {
          const operador = await this.clienteRepo.findOne({
            where: { id: updateUsoEquipoDto.operadorId },
          });
          if (!operador) {
            throw new NotFoundException('Operador no encontrado');
          }
          usoEquipo.operador = operador;
        } else {
          usoEquipo.operador = null;
        }
      }

      if (updateUsoEquipoDto.fechaInicio) {
        usoEquipo.fechaInicio = new Date(updateUsoEquipoDto.fechaInicio);
      }

      if (updateUsoEquipoDto.fechaFin) {
        usoEquipo.fechaFin = new Date(updateUsoEquipoDto.fechaFin);
      }

      if (updateUsoEquipoDto.fechaInicio || updateUsoEquipoDto.fechaFin) {
        if (usoEquipo.fechaInicio >= usoEquipo.fechaFin) {
          throw new BadRequestException(
            'La fecha de inicio debe ser menor a la fecha de fin',
          );
        }
      }

      if (updateUsoEquipoDto.horasTrabajadas !== undefined) {
        usoEquipo.horasTrabajadas = updateUsoEquipoDto.horasTrabajadas;
      }

      await this.usoEquipoRepo.save(usoEquipo);

      return {
        message: 'Uso de equipo actualizado exitosamente',
        usoEquipo: this.mapUsoEquipo(usoEquipo),
      };
    } catch (error) {
      throw error;
    }
  }

  private mapUsoEquipo(uso: UsoEquipo) {
    return {
      id: uso.id,
      fechaInicio: uso.fechaInicio,
      fechaFin: uso.fechaFin,
      horasTrabajadas: uso.horasTrabajadas,
      equipo: {
        id: uso.equipo?.id,
        nombre: uso.equipo?.nombre,
        codigoInterno: uso.equipo?.codigoInterno,
        tipo: uso.equipo?.tipo,
        marca: uso.equipo?.marca,
        modelo: uso.equipo?.modelo,
      },
      actividad: uso.actividad
        ? {
            id: uso.actividad.id,
            descripcion: uso.actividad.descripcion,
          }
        : null,
      operador: uso.operador
        ? {
            id: uso.operador.id,
            nombre: uso.operador.nombre,
            email: uso.operador.email,
          }
        : null,
    };
  }
}
