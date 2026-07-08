import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { differenceInCalendarDays } from 'date-fns';
import { HistorialFechasSanidad } from './entities/historial-fechas-sanidad.entity';
import { SanidadAnimal } from './entities/sanidad_animal.entity';
import { getPropietarioId } from '../utils/get-propietario-id';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class HistorialFechasService {
  constructor(
    @InjectRepository(HistorialFechasSanidad)
    private historialRepository: Repository<HistorialFechasSanidad>,
  ) {}

  async registrarCambioFechas(
    sanidad: SanidadAnimal,
    fechaEventoAnterior: Date | null,
    proximaFechaAnterior: Date | null,
    fechaEventoNueva: Date | null,
    proximaFechaNueva: Date | null,
    motivoCambio: string | undefined,
    usuario: Cliente,
  ): Promise<void> {
    const registros = [];
    const motivo = motivoCambio || 'Actualización de fechas';

    if (
      fechaEventoAnterior &&
      fechaEventoNueva &&
      new Date(fechaEventoAnterior).getTime() !==
        new Date(fechaEventoNueva).getTime()
    ) {
      const diasDiferencia = differenceInCalendarDays(
        new Date(fechaEventoNueva),
        new Date(fechaEventoAnterior),
      );

      registros.push({
        sanidad,
        sanidadId: sanidad.id,
        fecha_anterior: fechaEventoAnterior,
        fecha_nueva: fechaEventoNueva,
        motivo_cambio: motivo,
        tipo_cambio: 'fecha_evento',
        usuario: `${usuario.nombre} ` || usuario.email || 'Usuario',
        actualizadoPorId: usuario.id,
        actualizado_por: usuario,
        dias_diferencia: diasDiferencia,
      });
    }

    if (
      proximaFechaAnterior &&
      proximaFechaNueva &&
      new Date(proximaFechaAnterior).getTime() !==
        new Date(proximaFechaNueva).getTime()
    ) {
      const diasDiferencia = differenceInCalendarDays(
        new Date(proximaFechaNueva),
        new Date(proximaFechaAnterior),
      );

      registros.push({
        sanidad,
        sanidadId: sanidad.id,
        fecha_anterior: proximaFechaAnterior,
        fecha_nueva: proximaFechaNueva,
        motivo_cambio: motivo,
        tipo_cambio: 'proxima_fecha_evento',
        usuario: `${usuario.nombre} ` || usuario.email || 'Usuario',
        actualizadoPorId: usuario.id,
        actualizado_por: usuario,
        dias_diferencia: diasDiferencia,
      });
    }

    if (registros.length > 0) {
      await this.historialRepository.save(registros);
    }
  }

  async obtenerHistorialPorCliente(
    cliente: Cliente,
    paginationDto: PaginationDto,
  ): Promise<{
    historial: HistorialFechasSanidad[];
    total: number;
  }> {
    const { limit = 10, offset = 0, animalId } = paginationDto;
    const propietarioId = getPropietarioId(cliente);

    try {
      const queryBuilder = this.historialRepository
        .createQueryBuilder('historial')
        .leftJoinAndSelect('historial.sanidad', 'sanidad')
        .leftJoinAndSelect('sanidad.animal', 'animal')
        .leftJoinAndSelect('historial.actualizado_por', 'actualizado_por')
        .where('sanidad.propietarioId = :propietarioId', {
          propietarioId,
        });

      if (animalId) {
        queryBuilder.andWhere('animal.id = :animalId', {
          animalId,
        });
      }

      const total = await queryBuilder.getCount();

      const historial = await queryBuilder
        .orderBy('historial.fecha_cambio', 'DESC')
        .take(limit)
        .skip(offset)
        .getMany();

      return {
        historial,
        total,
      };
    } catch (error) {
      throw new BadRequestException('Error al obtener el historial de cambios');
    }
  }

  async obtenerUltimosCambios(
    limit: number = 10,
  ): Promise<HistorialFechasSanidad[]> {
    return this.historialRepository.find({
      relations: ['sanidad', 'sanidad.animal', 'actualizado_por'],
      order: { fecha_cambio: 'DESC' },
      take: limit,
    });
  }

  async obtenerEstadisticasCambios(sanidadId: string): Promise<any> {
    const historial = await this.historialRepository.find({
      where: { sanidadId },
      order: { fecha_cambio: 'ASC' },
    });

    if (historial.length === 0) {
      return {
        total_cambios: 0,
        promedio_dias_entre_cambios: 0,
        cambios_por_tipo: {},
        ultimo_cambio: null,
      };
    }

    const cambiosPorTipo = historial.reduce((acc, item) => {
      acc[item.tipo_cambio] = (acc[item.tipo_cambio] || 0) + 1;
      return acc;
    }, {});

    let totalDias = 0;
    for (let i = 1; i < historial.length; i++) {
      const diff = differenceInCalendarDays(
        new Date(historial[i].fecha_cambio),
        new Date(historial[i - 1].fecha_cambio),
      );
      totalDias += diff;
    }

    const promedioDias =
      historial.length > 1 ? Math.round(totalDias / (historial.length - 1)) : 0;

    return {
      total_cambios: historial.length,
      promedio_dias_entre_cambios: promedioDias,
      cambios_por_tipo: cambiosPorTipo,
      ultimo_cambio: historial[historial.length - 1],
    };
  }
}
