import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { FacturaDetalle } from '../factura_detalle/entities/factura_detalle.entity';
import { Cliente } from '../auth-clientes/entities/auth-cliente.entity';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import {
  DashboardData,
  DatosCategorias,
  DatosVentasMensuales,
  MetricasDashboard,
} from './interfaces/dashboard-data.interface';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(FacturaEncabezado)
    private readonly facturaEncabezadoRepo: Repository<FacturaEncabezado>,
    @InjectRepository(FacturaDetalle)
    private readonly facturaDetalleRepo: Repository<FacturaDetalle>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async getTopProductosVendidos(user: User) {
    const paisId = user.pais.id;

    return await this.facturaDetalleRepo
      .createQueryBuilder('detalle')
      .innerJoin('detalle.factura', 'factura')
      .innerJoin('detalle.producto_servicio', 'producto')
      .select('producto.nombre', 'producto')
      .addSelect('SUM(detalle.cantidad)', 'cantidad_total')
      .where('factura.estado = :estado', { estado: 'Procesada' })
      .andWhere('factura.pais_id = :paisId', { paisId })
      .groupBy('producto.nombre')
      .orderBy('cantidad_total', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getTopSucursales(
    user: User,
    limit: number = 10,
  ): Promise<Array<{ sucursal: string; total_ventas: number }>> {
    const paisId = user.pais.id;

    return await this.facturaEncabezadoRepo
      .createQueryBuilder('factura')
      .innerJoin('factura.sucursal', 'sucursal')
      .select('sucursal.nombre', 'sucursal')
      .addSelect('SUM(factura.total)', 'total_ventas')
      .where('factura.estado = :estado', { estado: 'Procesada' })
      .andWhere('factura.pais_id = :paisId', { paisId })
      .groupBy('sucursal.nombre')
      .orderBy('total_ventas', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
