import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJornadaTrabajadoreDto } from './dto/create-jornada_trabajadore.dto';
import { UpdateJornadaTrabajadoreDto } from './dto/update-jornada_trabajadore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Repository } from 'typeorm';
import { JornadaTrabajadore } from './entities/jornada_trabajadore.entity';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class JornadaTrabajadoresService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(JornadaTrabajadore)
    private readonly jornadaRepo: Repository<JornadaTrabajadore>,
  ) {}
  async create(propietario: Cliente, dto: CreateJornadaTrabajadoreDto) {
    if (propietario.rol !== TipoCliente.PROPIETARIO) {
      throw new BadRequestException(
        'Solamente los propietarios pueden ejecutar esta accion',
      );
    }
    try {
      const trabajador = await this.clienteRepo.findOne({
        where: { id: dto.trabajadorId },
      });

      if (!trabajador) {
        throw new NotFoundException('El trabajador no existe');
      }

      const existe = await this.jornadaRepo.findOne({
        where: {
          trabajadorId: dto.trabajadorId,
          fecha: dto.fecha,
        },
      });

      if (existe) {
        throw new BadRequestException(
          'Ya existe una jornada para este trabajador en esa fecha',
        );
      }

      if (!dto.trabajo) {
        if (
          dto.horasExtrasDiurnas > 0 ||
          dto.horasExtrasNocturnas > 0 ||
          dto.horasExtrasFestivas > 0
        ) {
          throw new BadRequestException(
            'No puede registrar horas extras si no trabajó',
          );
        }
      }

      const totalHorasExtras =
        (dto.horasExtrasDiurnas || 0) +
        (dto.horasExtrasNocturnas || 0) +
        (dto.horasExtrasFestivas || 0);

      if (totalHorasExtras > 24) {
        throw new BadRequestException(
          'Las horas extras no pueden superar 24 horas en un día',
        );
      }

      const jornada = this.jornadaRepo.create({
        ...dto,
        propietarioId: propietario.id,
        sincronizado: false,
      });

      await this.jornadaRepo.save(jornada);

      return 'Jornada Guardada Con Exito';
    } catch (error) {
      throw error;
    }
  }

  async findAll(propietario: Cliente, paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      name = '',
      fechaInicio,
      fechaFin,
      mes = '',
    } = paginationDto;

    const query = this.jornadaRepo
      .createQueryBuilder('j')
      .leftJoinAndSelect('j.trabajador', 't')
      .where('j.propietarioId = :propietarioId', {
        propietarioId: propietario.id,
      });

    if (name) {
      query.andWhere('LOWER(t.nombre) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (mes) {
      const [year, month] = mes.split('-').map(Number);

      const inicioMes = new Date(year, month - 1, 1);
      const finMes = new Date(year, month, 0);

      query.andWhere('j.fecha BETWEEN :inicioMes AND :finMes', {
        inicioMes,
        finMes,
      });
    } else if (fechaInicio && fechaFin) {
      query.andWhere('j.fecha BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      });
    } else if (fechaInicio) {
      query.andWhere('j.fecha >= :inicio', {
        inicio: fechaInicio,
      });
    } else if (fechaFin) {
      query.andWhere('j.fecha <= :fin', {
        fin: fechaFin,
      });
    }

    query.orderBy('j.fecha', 'DESC').skip(offset).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      jornadas: instanceToPlain(data),
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string, propietario: Cliente) {
    const jornada = await this.jornadaRepo.findOne({
      where: { id, propietarioId: propietario.id },
      relations: ['trabajador'],
    });

    if (!jornada) {
      throw new NotFoundException('Jornada no encontrada');
    }

    return instanceToPlain(jornada);
  }

  async update(
    id: string,
    propietario: Cliente,
    dto: UpdateJornadaTrabajadoreDto,
  ) {
    const jornada = await this.findOne(id, propietario);

    if (dto.trabajo === false) {
      if (
        dto.horasExtrasDiurnas > 0 ||
        dto.horasExtrasNocturnas > 0 ||
        dto.horasExtrasFestivas > 0
      ) {
        throw new BadRequestException(
          'No puede registrar horas extras si no trabajó',
        );
      }
    }

    const totalHorasExtras =
      (dto.horasExtrasDiurnas || 0) +
      (dto.horasExtrasNocturnas || 0) +
      (dto.horasExtrasFestivas || 0);

    if (totalHorasExtras > 24) {
      throw new BadRequestException(
        'Las horas extras no pueden superar 24 horas',
      );
    }

    Object.assign(jornada, dto);

    return await this.jornadaRepo.save(jornada);
  }
}
