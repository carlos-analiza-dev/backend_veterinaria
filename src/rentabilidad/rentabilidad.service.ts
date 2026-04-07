import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Gasto } from '../gastos/entities/gasto.entity';
import { Ingreso } from '../ingresos/entities/ingreso.entity';
import {
  FiltrosRentabilidad,
  RentabilidadGeneral,
  RentabilidadPorPeriodo,
  RentabilidadPorCategoria,
  RentabilidadPorFinca,
} from '../interfaces/rentabilidad.interface';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';

@Injectable()
export class RentabilidadService {
  constructor(
    @InjectRepository(Gasto)
    private gastoRepository: Repository<Gasto>,
    @InjectRepository(Ingreso)
    private ingresoRepository: Repository<Ingreso>,
    @InjectRepository(FincasGanadero)
    private fincaRepository: Repository<FincasGanadero>,
  ) {}

  async obtenerRentabilidadGeneral(
    filtros: FiltrosRentabilidad,
  ): Promise<RentabilidadGeneral> {
    const { fechaInicio, fechaFin, fincaId, especieId } = filtros;

    const gastosWhere: any = {};
    const ingresosWhere: any = {};

    if (fincaId) {
      gastosWhere.finca = { id: fincaId };
      ingresosWhere.finca = { id: fincaId };
    }

    if (especieId) {
      gastosWhere.especie = { id: especieId };
      ingresosWhere.especie = { id: especieId };
    }

    if (fechaInicio && fechaFin) {
      gastosWhere.fecha_gasto = Between(
        new Date(fechaInicio),
        new Date(fechaFin),
      );
      ingresosWhere.fecha_ingreso = Between(
        new Date(fechaInicio),
        new Date(fechaFin),
      );
    } else if (fechaInicio) {
      gastosWhere.fecha_gasto = MoreThanOrEqual(new Date(fechaInicio));
      ingresosWhere.fecha_ingreso = MoreThanOrEqual(new Date(fechaInicio));
    } else if (fechaFin) {
      gastosWhere.fecha_gasto = LessThanOrEqual(new Date(fechaFin));
      ingresosWhere.fecha_ingreso = LessThanOrEqual(new Date(fechaFin));
    }

    const [gastos, ingresos] = await Promise.all([
      this.gastoRepository.find({
        where: gastosWhere,
        relations: ['finca', 'especie'],
      }),
      this.ingresoRepository.find({
        where: ingresosWhere,
        relations: ['finca', 'especie'],
      }),
    ]);

    const totalIngresos = ingresos.reduce((sum, i) => sum + Number(i.monto), 0);
    const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
    const rentabilidadNeta = totalIngresos - totalGastos;
    const margenRentabilidad =
      totalIngresos > 0 ? (rentabilidadNeta / totalIngresos) * 100 : 0;
    const roi = totalGastos > 0 ? (rentabilidadNeta / totalGastos) * 100 : 0;

    const rentabilidadPorMes = await this.obtenerRentabilidadPorPeriodo(
      'month',
      filtros,
    );

    const mejorMes =
      rentabilidadPorMes.length > 0
        ? rentabilidadPorMes.reduce((best, current) =>
            current.rentabilidad > best.rentabilidad ? current : best,
          )
        : null;

    const peorMes =
      rentabilidadPorMes.length > 0
        ? rentabilidadPorMes.reduce((worst, current) =>
            current.rentabilidad < worst.rentabilidad ? current : worst,
          )
        : null;

    return {
      totalIngresos,
      totalGastos,
      rentabilidadNeta,
      margenRentabilidad,
      roi,
      mejorMes,
      peorMes,
    };
  }

  async obtenerRentabilidadPorPeriodo(
    periodo: 'day' | 'week' | 'month' | 'year',
    filtros: FiltrosRentabilidad,
  ): Promise<RentabilidadPorPeriodo[]> {
    const { fechaInicio, fechaFin, fincaId, especieId } = filtros;

    let startDate = fechaInicio
      ? new Date(fechaInicio)
      : startOfMonth(subMonths(new Date(), 11));
    let endDate = fechaFin ? new Date(fechaFin) : endOfMonth(new Date());

    let ingresosQuery = this.ingresoRepository
      .createQueryBuilder('ingreso')
      .select(`SUM(ingreso.monto)::float`, 'total')
      .addSelect(
        this.getDateGroupQuery(periodo, 'ingreso.fecha_ingreso'),
        'periodo',
      )
      .where('ingreso.fecha_ingreso BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (fincaId) {
      ingresosQuery = ingresosQuery.andWhere('ingreso.fincaId = :fincaId', {
        fincaId,
      });
    }
    if (especieId) {
      ingresosQuery = ingresosQuery.andWhere('ingreso.especieId = :especieId', {
        especieId,
      });
    }

    ingresosQuery = ingresosQuery.groupBy('periodo');
    const ingresosPorPeriodo = await ingresosQuery.getRawMany();

    let gastosQuery = this.gastoRepository
      .createQueryBuilder('gasto')
      .select(`SUM(gasto.monto)::float`, 'total')
      .addSelect(
        this.getDateGroupQuery(periodo, 'gasto.fecha_gasto'),
        'periodo',
      )
      .where('gasto.fecha_gasto BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (fincaId) {
      gastosQuery = gastosQuery.andWhere('gasto.fincaId = :fincaId', {
        fincaId,
      });
    }
    if (especieId) {
      gastosQuery = gastosQuery.andWhere('gasto.especieId = :especieId', {
        especieId,
      });
    }

    gastosQuery = gastosQuery.groupBy('periodo');
    const gastosPorPeriodo = await gastosQuery.getRawMany();

    // Combinar resultados
    const allPeriods = new Set([
      ...ingresosPorPeriodo.map((i) => i.periodo),
      ...gastosPorPeriodo.map((g) => g.periodo),
    ]);

    const result: RentabilidadPorPeriodo[] = [];

    for (const periodoStr of allPeriods) {
      const ingreso = ingresosPorPeriodo.find((i) => i.periodo === periodoStr);
      const gasto = gastosPorPeriodo.find((g) => g.periodo === periodoStr);

      const ingresos = ingreso ? Number(ingreso.total) : 0;
      const gastos = gasto ? Number(gasto.total) : 0;
      const rentabilidad = ingresos - gastos;
      const margen = ingresos > 0 ? (rentabilidad / ingresos) * 100 : 0;

      result.push({
        periodo: periodoStr,
        ingresos,
        gastos,
        rentabilidad,
        margen,
      });
    }

    return result.sort((a, b) => a.periodo.localeCompare(b.periodo));
  }

  async obtenerRentabilidadPorCategoria(
    filtros: FiltrosRentabilidad,
  ): Promise<RentabilidadPorCategoria[]> {
    const { fechaInicio, fechaFin, fincaId, especieId } = filtros;

    const result: RentabilidadPorCategoria[] = [];

    let ingresosQuery = this.ingresoRepository
      .createQueryBuilder('ingreso')
      .select('ingreso.categoria', 'categoria')
      .addSelect('SUM(ingreso.monto)::float', 'total')
      .where(
        this.buildDateCondition('ingreso.fecha_ingreso', fechaInicio, fechaFin),
      );

    if (fincaId) {
      ingresosQuery = ingresosQuery.andWhere('ingreso.fincaId = :fincaId', {
        fincaId,
      });
    }
    if (especieId) {
      ingresosQuery = ingresosQuery.andWhere('ingreso.especieId = :especieId', {
        especieId,
      });
    }

    ingresosQuery = ingresosQuery.groupBy('ingreso.categoria');
    const ingresosPorCategoria = await ingresosQuery.getRawMany();

    const totalIngresos = ingresosPorCategoria.reduce(
      (sum, i) => sum + Number(i.total),
      0,
    );

    for (const item of ingresosPorCategoria) {
      result.push({
        categoria: item.categoria,
        tipo: 'ingreso',
        monto: Number(item.total),
        porcentaje:
          totalIngresos > 0 ? (Number(item.total) / totalIngresos) * 100 : 0,
      });
    }

    let gastosQuery = this.gastoRepository
      .createQueryBuilder('gasto')
      .select('gasto.categoria', 'categoria')
      .addSelect('SUM(gasto.monto)::float', 'total')
      .where(
        this.buildDateCondition('gasto.fecha_gasto', fechaInicio, fechaFin),
      );

    if (fincaId) {
      gastosQuery = gastosQuery.andWhere('gasto.fincaId = :fincaId', {
        fincaId,
      });
    }
    if (especieId) {
      gastosQuery = gastosQuery.andWhere('gasto.especieId = :especieId', {
        especieId,
      });
    }

    gastosQuery = gastosQuery.groupBy('gasto.categoria');
    const gastosPorCategoria = await gastosQuery.getRawMany();

    const totalGastos = gastosPorCategoria.reduce(
      (sum, g) => sum + Number(g.total),
      0,
    );

    for (const item of gastosPorCategoria) {
      result.push({
        categoria: item.categoria,
        tipo: 'gasto',
        monto: Number(item.total),
        porcentaje:
          totalGastos > 0 ? (Number(item.total) / totalGastos) * 100 : 0,
      });
    }

    return result.sort((a, b) => b.monto - a.monto);
  }

  async obtenerRentabilidadPorFinca(
    filtros: FiltrosRentabilidad,
  ): Promise<RentabilidadPorFinca[]> {
    const { fechaInicio, fechaFin } = filtros;

    const fincasGastos = await this.gastoRepository
      .createQueryBuilder('gasto')
      .select('DISTINCT gasto.fincaId', 'id')
      .where('gasto.fincaId IS NOT NULL')
      .getRawMany();

    const fincasIngresos = await this.ingresoRepository
      .createQueryBuilder('ingreso')
      .select('DISTINCT ingreso.fincaId', 'id')
      .where('ingreso.fincaId IS NOT NULL')
      .getRawMany();

    const fincasIds = [
      ...new Set([
        ...fincasGastos.map((f) => f.id),
        ...fincasIngresos.map((f) => f.id),
      ]),
    ].filter((id) => id);

    const result: RentabilidadPorFinca[] = [];

    for (const fincaId of fincasIds) {
      if (!fincaId) continue;

      let ingresosQuery = this.ingresoRepository
        .createQueryBuilder('ingreso')
        .select('SUM(ingreso.monto)::float', 'total')
        .where('ingreso.fincaId = :fincaId', { fincaId })
        .andWhere(
          this.buildDateCondition(
            'ingreso.fecha_ingreso',
            fechaInicio,
            fechaFin,
          ),
        );

      let gastosQuery = this.gastoRepository
        .createQueryBuilder('gasto')
        .select('SUM(gasto.monto)::float', 'total')
        .where('gasto.fincaId = :fincaId', { fincaId })
        .andWhere(
          this.buildDateCondition('gasto.fecha_gasto', fechaInicio, fechaFin),
        );

      const [ingresosResult, gastosResult] = await Promise.all([
        ingresosQuery.getRawOne(),
        gastosQuery.getRawOne(),
      ]);

      const ingresos = ingresosResult?.total ? Number(ingresosResult.total) : 0;
      const gastos = gastosResult?.total ? Number(gastosResult.total) : 0;
      const rentabilidad = ingresos - gastos;
      const margen = ingresos > 0 ? (rentabilidad / ingresos) * 100 : 0;

      result.push({
        fincaId,
        fincaNombre: await this.getFincaNombre(fincaId),
        ingresos,
        gastos,
        rentabilidad,
        margen,
      });
    }

    return result.sort((a, b) => b.rentabilidad - a.rentabilidad);
  }

  private getDateGroupQuery(periodo: string, fieldName: string): string {
    switch (periodo) {
      case 'day':
        return `TO_CHAR(${fieldName}, 'YYYY-MM-DD')`;
      case 'week':
        return `TO_CHAR(DATE_TRUNC('week', ${fieldName}), 'YYYY-MM-DD')`;
      case 'month':
        return `TO_CHAR(DATE_TRUNC('month', ${fieldName}), 'YYYY-MM')`;
      case 'year':
        return `TO_CHAR(DATE_TRUNC('year', ${fieldName}), 'YYYY')`;
      default:
        return `TO_CHAR(DATE_TRUNC('month', ${fieldName}), 'YYYY-MM')`;
    }
  }

  private buildDateCondition(
    field: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): string {
    if (fechaInicio && fechaFin) {
      return `${field} BETWEEN :fechaInicio AND :fechaFin`;
    } else if (fechaInicio) {
      return `${field} >= :fechaInicio`;
    } else if (fechaFin) {
      return `${field} <= :fechaFin`;
    }
    return '1=1';
  }
  private async getFincaNombre(fincaId: string): Promise<string> {
    const finca = await this.fincaRepository.findOne({
      where: { id: fincaId },
    });

    if (!finca) {
      return fincaId;
    } else {
      return finca.nombre_finca;
    }
  }
}
