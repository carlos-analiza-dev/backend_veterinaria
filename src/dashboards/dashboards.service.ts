import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { FacturaDetalle } from '../factura_detalle/entities/factura_detalle.entity';
import { Cliente } from '../auth-clientes/entities/auth-cliente.entity';
import {
  EstadoFactura,
  FacturaEncabezado,
} from 'src/factura_encabezado/entities/factura_encabezado.entity';
import {
  DashboardData,
  DatosCategorias,
  DatosVentasMensuales,
  MetricasDashboard,
  RendimientoMensualResponse,
} from './interfaces/dashboard-data.interface';
import { User } from 'src/auth/entities/auth.entity';
import { TipoSubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { CompraInsumo } from 'src/compra-insumos/entities/compra-insumo.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(FacturaEncabezado)
    private readonly facturaEncabezadoRepo: Repository<FacturaEncabezado>,
    @InjectRepository(FacturaDetalle)
    private readonly facturaDetalleRepo: Repository<FacturaDetalle>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(User)
    private readonly usuarioRepo: Repository<User>,
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(CompraInsumo)
    private readonly compraInsumoRepository: Repository<CompraInsumo>,
  ) {}

  async getIngresosTotales(paginationDto: PaginationDto) {
    const { year, fechaInicio, fechaFin } = paginationDto;

    const query = this.facturaEncabezadoRepo
      .createQueryBuilder('factura')
      .select('SUM(factura.total)', 'ingresosTotales')
      .where('factura.estado = :estado', { estado: EstadoFactura.PROCESADA });

    if (year) {
      query.andWhere('EXTRACT(YEAR FROM factura.created_at) = :year', { year });
    }

    if (fechaInicio && fechaFin) {
      query.andWhere(
        'DATE(factura.created_at) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)',
        { fechaInicio, fechaFin },
      );
    } else if (fechaInicio) {
      query.andWhere('DATE(factura.created_at) >= DATE(:fechaInicio)', {
        fechaInicio,
      });
    } else if (fechaFin) {
      query.andWhere('DATE(factura.created_at) <= DATE(:fechaFin)', {
        fechaFin,
      });
    }

    const resultado = await query.getRawOne();

    return {
      ingresosTotales: parseFloat(resultado?.ingresosTotales || 0),
      year: year || new Date().getFullYear(),
    };
  }

  async getRendimientoMensual(
    user: User,
    year?: number,
  ): Promise<RendimientoMensualResponse> {
    const currentYear = year || new Date().getFullYear();

    const ventasPorMes = await this.obtenerVentasPorMes(currentYear, user);

    const costosPorMes = await this.obtenerCostosPorMes(currentYear, user);

    const datosVentas = this.combinarDatosVentas(
      ventasPorMes,
      costosPorMes,
      currentYear,
    );

    return {
      datosVentas,
      periodo: currentYear.toString(),
    };
  }

  async getTendenciaIngresos(
    user: User,
    year?: number,
  ): Promise<RendimientoMensualResponse> {
    return await this.getRendimientoMensual(user, year);
  }

  private async obtenerVentasPorMes(year: number, user: User): Promise<any[]> {
    const meses = Array.from({ length: 12 }, (_, i) => i + 1);

    const ventasPromises = meses.map(async (mes) => {
      const startDate = new Date(year, mes - 1, 1);
      const endDate = new Date(year, mes, 0, 23, 59, 59);

      const ventas = await this.facturaEncabezadoRepo
        .createQueryBuilder('factura')
        .select('SUM(factura.total)', 'totalIngresos')
        .addSelect('COUNT(factura.id)', 'cantidadVentas')
        .where('factura.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .andWhere('factura.estado = :estado', {
          estado: EstadoFactura.PROCESADA,
        })

        .getRawOne();

      return {
        mes,
        ingresos: parseFloat(ventas?.totalIngresos || 0),
        subtotal: parseFloat(ventas?.subtotal || 0),
        impuestos: parseFloat(ventas?.impuestos || 0),
        cantidad_ventas: parseInt(ventas?.cantidadVentas || 0),
      };
    });

    return Promise.all(ventasPromises);
  }

  private async obtenerCostosPorMes(year: number, user: User): Promise<any[]> {
    const meses = Array.from({ length: 12 }, (_, i) => i + 1);

    const costosPromises = meses.map(async (mes) => {
      const startDate = new Date(year, mes - 1, 1);
      const endDate = new Date(year, mes, 0, 23, 59, 59);

      const comprasProductos = await this.compraRepository
        .createQueryBuilder('compra')
        .select('SUM(compra.total)', 'totalCompras')
        .where('compra.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();

      const comprasInsumos = await this.compraInsumoRepository
        .createQueryBuilder('compra')
        .select('SUM(compra.total)', 'totalCompras')
        .where('compra.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();

      const totalComprasProductos = parseFloat(
        comprasProductos?.totalCompras || 0,
      );
      const totalComprasInsumos = parseFloat(comprasInsumos?.totalCompras || 0);

      return {
        mes,
        costo: totalComprasProductos + totalComprasInsumos,
      };
    });

    return Promise.all(costosPromises);
  }

  private combinarDatosVentas(
    ventasPorMes: any[],
    costosPorMes: any[],
    year: number,
  ): DatosVentasMensuales[] {
    const nombresMeses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    return ventasPorMes.map((venta, index) => {
      const costoMes =
        costosPorMes.find((c) => c.mes === venta.mes)?.costo || 0;
      const ganancias = venta.ingresos - costoMes;

      return {
        mes: nombresMeses[venta.mes - 1],
        ingresos: venta.ingresos,
        ganancias: Math.max(ganancias, 0),
        costo: costoMes,
        cantidad_ventas: venta.cantidad_ventas,
      };
    });
  }

  async getClientesActivos(user: User) {
    const clientesActivosActual = await this.clienteRepo.count({
      where: { isActive: true },
    });

    const fechaActual = new Date();
    const mesAnterior = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() - 1,
      1,
    );
    const finMesAnterior = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      0,
    );

    const clientesActivosMesAnterior = await this.clienteRepo.count({
      where: {
        isActive: true,
        createdAt: Between(mesAnterior, finMesAnterior),
      },
    });

    let porcentajeCambio = 0;
    if (clientesActivosMesAnterior > 0) {
      porcentajeCambio =
        ((clientesActivosActual - clientesActivosMesAnterior) /
          clientesActivosMesAnterior) *
        100;
    }

    return {
      total: clientesActivosActual,
      porcentajeCambio: porcentajeCambio.toFixed(1),
      tendencia: porcentajeCambio >= 0 ? 'positive' : 'negative',
    };
  }

  async getUsuariosActivos(user: User) {
    const usuariosActivosActual = await this.usuarioRepo.count({
      where: { isActive: true },
    });

    const fechaActual = new Date();
    const mesAnterior = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() - 1,
      1,
    );
    const finMesAnterior = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      0,
    );

    const usuariosActivosMesAnterior = await this.clienteRepo.count({
      where: {
        isActive: true,
        createdAt: Between(mesAnterior, finMesAnterior),
      },
    });

    let porcentajeCambio = 0;
    if (usuariosActivosMesAnterior > 0) {
      porcentajeCambio =
        ((usuariosActivosActual - usuariosActivosMesAnterior) /
          usuariosActivosMesAnterior) *
        100;
    }

    return {
      total: usuariosActivosActual,
      porcentajeCambio: porcentajeCambio.toFixed(1),
      tendencia: porcentajeCambio >= 0 ? 'positive' : 'negative',
    };
  }

  async getTopProductosVendidos(user: User, paginationDto: PaginationDto) {
    const { fechaInicio, fechaFin } = paginationDto;
    const paisId = user.pais.id;

    const query = this.facturaDetalleRepo
      .createQueryBuilder('detalle')
      .innerJoin('detalle.factura', 'factura')
      .innerJoin('detalle.producto_servicio', 'producto')
      .select('producto.nombre', 'producto')
      .addSelect('SUM(detalle.cantidad)', 'cantidad_total')
      .where('factura.estado = :estado', { estado: 'Procesada' })
      .andWhere('factura.pais_id = :paisId', { paisId })
      .andWhere('producto.tipo = :tipo', { tipo: TipoSubServicio.PRODUCTO })
      .groupBy('producto.nombre')
      .orderBy('cantidad_total', 'DESC')
      .limit(10);

    if (fechaInicio && fechaFin) {
      query.andWhere(
        'DATE(factura.created_at) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)',
        { fechaInicio, fechaFin },
      );
    } else if (fechaInicio) {
      query.andWhere('DATE(factura.created_at) >= DATE(:fechaInicio)', {
        fechaInicio,
      });
    } else if (fechaFin) {
      query.andWhere('DATE(factura.created_at) <= DATE(:fechaFin)', {
        fechaFin,
      });
    }

    return await query.getRawMany();
  }

  async getTopServiciosVendidos(user: User, paginationDto: PaginationDto) {
    const { fechaInicio, fechaFin } = paginationDto;
    const paisId = user.pais.id;

    const query = this.facturaDetalleRepo
      .createQueryBuilder('detalle')
      .innerJoin('detalle.factura', 'factura')
      .innerJoin('detalle.producto_servicio', 'producto')
      .select('producto.nombre', 'producto')
      .addSelect('SUM(detalle.cantidad)', 'cantidad_total')
      .where('factura.estado = :estado', { estado: 'Procesada' })
      .andWhere('factura.pais_id = :paisId', { paisId })
      .andWhere('producto.tipo = :tipo', { tipo: TipoSubServicio.SERVICIO })
      .groupBy('producto.nombre')
      .orderBy('cantidad_total', 'DESC')
      .limit(10);

    if (fechaInicio && fechaFin) {
      query.andWhere(
        'DATE(factura.created_at) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)',
        { fechaInicio, fechaFin },
      );
    } else if (fechaInicio) {
      query.andWhere('DATE(factura.created_at) >= DATE(:fechaInicio)', {
        fechaInicio,
      });
    } else if (fechaFin) {
      query.andWhere('DATE(factura.created_at) <= DATE(:fechaFin)', {
        fechaFin,
      });
    }

    return await query.getRawMany();
  }

  async getTopSucursales(
    user: User,
    paginationDto: PaginationDto,
  ): Promise<Array<{ sucursal: string; total_ventas: number }>> {
    const { limit = 5, fechaInicio, fechaFin } = paginationDto;
    const paisId = user.pais.id;

    const query = this.facturaEncabezadoRepo
      .createQueryBuilder('factura')
      .innerJoin('factura.sucursal', 'sucursal')
      .select('sucursal.nombre', 'sucursal')
      .addSelect('SUM(factura.total)', 'total_ventas')
      .where('factura.estado = :estado', { estado: 'Procesada' })
      .andWhere('factura.pais_id = :paisId', { paisId })
      .groupBy('sucursal.nombre')
      .orderBy('total_ventas', 'DESC')
      .limit(limit);

    if (fechaInicio && fechaFin) {
      query.andWhere(
        'DATE(factura.created_at) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)',
        { fechaInicio, fechaFin },
      );
    } else if (fechaInicio) {
      query.andWhere('DATE(factura.created_at) >= DATE(:fechaInicio)', {
        fechaInicio,
      });
    } else if (fechaFin) {
      query.andWhere('DATE(factura.created_at) <= DATE(:fechaFin)', {
        fechaFin,
      });
    }

    return await query.getRawMany();
  }
}
