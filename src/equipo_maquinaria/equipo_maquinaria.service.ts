import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEquipoMaquinariaDto } from './dto/create-equipo_maquinaria.dto';
import { UpdateEquipoMaquinariaDto } from './dto/update-equipo_maquinaria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { Repository } from 'typeorm';
import { EquipoMaquinaria } from './entities/equipo_maquinaria.entity';
import { EstadoMaquinaria } from 'src/interfaces/maquinaria/maquinaria.enums';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { getPropietarioId } from 'src/utils/get-propietario-id';

@Injectable()
export class EquipoMaquinariaService {
  constructor(
    @InjectRepository(FincasGanadero)
    private readonly fincasRepository: Repository<FincasGanadero>,
    @InjectRepository(EquipoMaquinaria)
    private readonly equipoMaquinariaRepository: Repository<EquipoMaquinaria>,
  ) {}
  async create(createEquipoMaquinariaDto: CreateEquipoMaquinariaDto) {
    try {
      if (createEquipoMaquinariaDto.fincaId) {
        const finca = await this.fincasRepository.findOne({
          where: { id: createEquipoMaquinariaDto.fincaId },
        });

        if (!finca) {
          throw new NotFoundException(`Finca no encontrada`);
        }
      }

      if (createEquipoMaquinariaDto.numeroSerie) {
        const equipoExistente = await this.equipoMaquinariaRepository.findOne({
          where: { numeroSerie: createEquipoMaquinariaDto.numeroSerie },
        });

        if (equipoExistente) {
          throw new BadRequestException(
            `Ya existe un equipo con el número de serie ${createEquipoMaquinariaDto.numeroSerie}`,
          );
        }
      }

      const codigoInterno = await this.generarCodigoInterno();

      const nuevoEquipo = this.equipoMaquinariaRepository.create({
        ...createEquipoMaquinariaDto,
        codigoInterno,
      });

      if (nuevoEquipo.vidaUtilHoras && nuevoEquipo.horasUso) {
        const porcentajeUso =
          (nuevoEquipo.horasUso / nuevoEquipo.vidaUtilHoras) * 100;

        if (
          porcentajeUso >= 90 &&
          nuevoEquipo.estado === EstadoMaquinaria.ACTIVO
        ) {
          nuevoEquipo.estado = EstadoMaquinaria.MANTENIMIENTO;
        }
      }

      await this.equipoMaquinariaRepository.save(nuevoEquipo);

      return 'Equipo Guardado Exitosamente';
    } catch (error) {
      throw error;
    }
  }

  private async generarCodigoInterno(): Promise<string> {
    const ultimoEquipo = await this.equipoMaquinariaRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    let numero = 1;

    if (ultimoEquipo.length > 0 && ultimoEquipo[0].codigoInterno) {
      const ultimoCodigo = ultimoEquipo[0].codigoInterno;
      const match = ultimoCodigo.match(/\d+$/);

      if (match) {
        numero = parseInt(match[0], 10) + 1;
      }
    }

    return `EQ-${numero.toString().padStart(4, '0')}`;
  }

  async findAll(cliente: Cliente, paginationDto: PaginationDto) {
    const propietarioId = getPropietarioId(cliente);

    const { limit = 10, offset = 0, estado, fincaId } = paginationDto;

    const query = this.equipoMaquinariaRepository
      .createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.finca', 'finca')
      .leftJoin('finca.propietario', 'propietario')
      .where('propietario.id = :propietarioId', { propietarioId });

    if (estado) {
      query.andWhere('equipo.estado = :estado', { estado });
    }

    if (fincaId) {
      query.andWhere('equipo.fincaId = :fincaId', { fincaId });
    }

    const total = await query.getCount();

    const data = await query
      .orderBy('equipo.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit),
      equipos: data,
    };
  }

  async findActivos(cliente: Cliente) {
    const propietarioId = getPropietarioId(cliente);
    try {
      const equipos = await this.equipoMaquinariaRepository.find({
        where: {
          finca: { propietario: { id: propietarioId } },
          estado: EstadoMaquinaria.ACTIVO,
        },
      });
      if (!equipos)
        throw new NotFoundException(
          'No se encontraron equipos disponibles en este momento',
        );
      return equipos;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const equipo = await this.equipoMaquinariaRepository.findOne({
        where: { id },
        relations: ['finca'],
      });
      if (!equipo)
        throw new NotFoundException('No se encontro el equipo seleccionado');
      return equipo;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateEquipoMaquinariaDto: UpdateEquipoMaquinariaDto,
    cliente: Cliente,
  ) {
    try {
      const propietarioId = getPropietarioId(cliente);

      const equipoExistente = await this.equipoMaquinariaRepository
        .createQueryBuilder('equipo')
        .leftJoin('equipo.finca', 'finca')
        .leftJoin('finca.propietario', 'propietario')
        .where('equipo.id = :id', { id })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .getOne();

      if (!equipoExistente) {
        throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
      }

      if (updateEquipoMaquinariaDto.fincaId) {
        const finca = await this.fincasRepository.findOne({
          where: { id: updateEquipoMaquinariaDto.fincaId },
        });

        if (!finca) {
          throw new NotFoundException(`Finca no encontrada`);
        }
      }

      if (
        updateEquipoMaquinariaDto.numeroSerie &&
        updateEquipoMaquinariaDto.numeroSerie !== equipoExistente.numeroSerie
      ) {
        const equipoConSerie = await this.equipoMaquinariaRepository.findOne({
          where: { numeroSerie: updateEquipoMaquinariaDto.numeroSerie },
        });

        if (equipoConSerie) {
          throw new BadRequestException(
            `Ya existe un equipo con el número de serie ${updateEquipoMaquinariaDto.numeroSerie}`,
          );
        }
      }

      Object.assign(equipoExistente, updateEquipoMaquinariaDto);

      if (equipoExistente.vidaUtilHoras && equipoExistente.horasUso) {
        const porcentajeUso =
          (Number(equipoExistente.horasUso) /
            Number(equipoExistente.vidaUtilHoras)) *
          100;

        if (porcentajeUso >= 100) {
          equipoExistente.estado = EstadoMaquinaria.INACTIVO;
        } else if (
          porcentajeUso >= 90 &&
          equipoExistente.estado === EstadoMaquinaria.ACTIVO
        ) {
          equipoExistente.estado = EstadoMaquinaria.MANTENIMIENTO;
        }
      }

      const equipoActualizado =
        await this.equipoMaquinariaRepository.save(equipoExistente);

      return {
        success: true,
        message: 'Equipo actualizado exitosamente',
        data: equipoActualizado,
      };
    } catch (error) {
      throw error;
    }
  }

  async cambiarEstado(id: string, estado: EstadoMaquinaria, cliente: Cliente) {
    try {
      const propietarioId = getPropietarioId(cliente);

      const equipo = await this.equipoMaquinariaRepository
        .createQueryBuilder('equipo')
        .leftJoin('equipo.finca', 'finca')
        .leftJoin('finca.propietario', 'propietario')
        .where('equipo.id = :id', { id })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .getOne();

      if (!equipo) {
        throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
      }

      const estadoAnterior = equipo.estado;
      equipo.estado = estado;

      await this.equipoMaquinariaRepository.save(equipo);

      return {
        success: true,
        message: `Estado cambiado de ${estadoAnterior} a ${estado}`,
        data: equipo,
      };
    } catch (error) {
      throw error;
    }
  }
}
