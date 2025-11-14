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
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { EstadoCita } from 'src/interfaces/estados_citas';
import { EspeciesFincaDto } from 'src/fincas_ganadero/dto/especies-finca.dto';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import {
  ProduccionGanadera,
  TipoProduccionGanadera,
} from 'src/produccion_ganadera/entities/produccion_ganadera.entity';
import {
  ProduccionGanaderaFincaDto,
  ResumenProduccionGanadera,
} from './interfaces/produccion-ganadera.interface';

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
    @InjectRepository(AnimalFinca)
    private readonly animalRepository: Repository<AnimalFinca>,
    @InjectRepository(FincasGanadero)
    private readonly fincaRepository: Repository<FincasGanadero>,
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>,
    @InjectRepository(ProduccionFinca)
    private readonly produccionFincaRepository: Repository<ProduccionFinca>,
    @InjectRepository(ProduccionGanadera)
    private readonly produccionGanaderaRepository: Repository<ProduccionGanadera>,
  ) {}

  async getIngresosTotales(user: User, paginationDto: PaginationDto) {
    const paisId = user.pais.id || '';
    const { year, fechaInicio, fechaFin } = paginationDto;

    const query = this.facturaEncabezadoRepo
      .createQueryBuilder('factura')
      .select('SUM(factura.total)', 'ingresosTotales')
      .where('factura.estado = :estado', { estado: EstadoFactura.PROCESADA })
      .andWhere('factura.pais_id = :paisId', { paisId });

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
    const paisId = user.pais.id || '';
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
        .andWhere('factura.pais_id = :paisId', { paisId })
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
    const paisId = user.pais.id || '';
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
        .andWhere('compra.paisId = :paisId', { paisId })
        .getRawOne();

      const comprasInsumos = await this.compraInsumoRepository
        .createQueryBuilder('compra')
        .select('SUM(compra.total)', 'totalCompras')
        .where('compra.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .andWhere('compra.paisId = :paisId', { paisId })
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

  //ANIMALES
  async getTotalAnimales(cliente: Cliente) {
    return await this.animalRepository.count({
      where: {
        propietario: { id: cliente.id, animales: { animal_muerte: false } },
      },
    });
  }

  async getAnimalesPorSexo(cliente: Cliente) {
    const result = await this.animalRepository
      .createQueryBuilder('animal')
      .innerJoin('animal.propietario', 'propietario')
      .select('animal.sexo', 'sexo')
      .addSelect('COUNT(*)', 'total')
      .where('propietario.id = :id', { id: cliente.id })
      .groupBy('animal.sexo')
      .getRawMany();

    return result;
  }

  async getVivosVsMuertos(cliente: Cliente) {
    const result = await this.animalRepository
      .createQueryBuilder('animal')
      .innerJoin('animal.propietario', 'propietario')
      .select(
        `SUM(CASE WHEN animal.animal_muerte = true THEN 1 ELSE 0 END)`,
        'muertos',
      )
      .addSelect(
        `SUM(CASE WHEN animal.animal_muerte = false THEN 1 ELSE 0 END)`,
        'vivos',
      )
      .where('propietario.id = :id', { id: cliente.id })
      .getRawOne();

    return result;
  }

  async getCompradosVsNacidos(cliente: Cliente) {
    const result = await this.animalRepository
      .createQueryBuilder('animal')
      .innerJoin('animal.propietario', 'propietario')
      .select(
        `SUM(CASE WHEN animal.compra_animal = true THEN 1 ELSE 0 END)`,
        'comprados',
      )
      .addSelect(
        `SUM(CASE WHEN animal.compra_animal = false THEN 1 ELSE 0 END)`,
        'nacidos',
      )
      .where('propietario.id = :id', { id: cliente.id })
      .getRawOne();

    return result;
  }

  //FINCA
  async getTotalFincas(cliente: Cliente) {
    return await this.fincaRepository.count({
      where: {
        propietario: { id: cliente.id },
      },
    });
  }

  async getFincasPorTipoExplotacion(cliente: Cliente) {
    return await this.fincaRepository
      .createQueryBuilder('f')
      .select(
        "jsonb_array_elements(f.tipo_explotacion)->>'tipo_explotacion'",
        'tipo',
      )
      .addSelect('COUNT(*)', 'total')
      .where('f.propietario = :clienteId', { clienteId: cliente.id })
      .groupBy("jsonb_array_elements(f.tipo_explotacion)->>'tipo_explotacion'")
      .getRawMany();
  }

  async getFincasPorEspecie(cliente: Cliente): Promise<EspeciesFincaDto[]> {
    const fincas = await this.fincaRepository.find({
      where: { isActive: true, propietario: { id: cliente.id } },
      relations: ['propietario'],
      select: {
        id: true,
        nombre_finca: true,
        especies_maneja: true,
      },
    });

    return fincas.map((finca) => ({
      id: finca.id,
      nombre_finca: finca.nombre_finca,
      especies: finca.especies_maneja || [],
      cantidad_total_especies: this.calcularTotalEspecies(
        finca.especies_maneja,
      ),
    }));
  }

  private calcularTotalEspecies(
    especies: { especie: string; cantidad: number }[] | null,
  ): number {
    if (!especies) return 0;

    return especies.reduce((total, especie) => total + especie.cantidad, 0);
  }

  async getProduccionGanaderaPorFinca(
    cliente: Cliente,
  ): Promise<ResumenProduccionGanadera> {
    const fincasConProduccion = await this.produccionFincaRepository
      .createQueryBuilder('produccionFinca')
      .innerJoinAndSelect('produccionFinca.finca', 'finca')
      .leftJoinAndSelect('produccionFinca.ganadera', 'ganadera')
      .where('finca.propietario = :clienteId', { clienteId: cliente.id })
      .andWhere('finca.isActive = :isActive', { isActive: true })
      .getMany();

    const fincasData: ProduccionGanaderaFincaDto[] = fincasConProduccion.map(
      (produccion) => {
        const ganadera = produccion.ganadera;

        const vacasOrdeño = ganadera?.vacasOrdeño
          ? Number(ganadera.vacasOrdeño)
          : 0;
        const vacasSecas = ganadera?.vacasSecas
          ? Number(ganadera.vacasSecas)
          : 0;
        const terneros = ganadera?.terneros ? Number(ganadera.terneros) : 0;
        const totalBovinos = vacasOrdeño + vacasSecas + terneros;

        const tieneProduccionLeche =
          ganadera?.tiposProduccion?.includes(TipoProduccionGanadera.LECHE) ||
          false;

        return {
          id: produccion.finca.id,
          nombre_finca: produccion.finca.nombre_finca,
          vacas_ordeño: vacasOrdeño,
          vacas_secas: vacasSecas,
          terneros: terneros,
          total_bovinos: totalBovinos,
          tiene_produccion_leche: tieneProduccionLeche,
        };
      },
    );

    const totalVacasOrdeño = fincasData.reduce(
      (sum, finca) => sum + finca.vacas_ordeño,
      0,
    );
    const totalVacasSecas = fincasData.reduce(
      (sum, finca) => sum + finca.vacas_secas,
      0,
    );
    const totalTerneros = fincasData.reduce(
      (sum, finca) => sum + finca.terneros,
      0,
    );
    const totalBovinos = fincasData.reduce(
      (sum, finca) => sum + finca.total_bovinos,
      0,
    );
    const fincasConProduccionLeche = fincasData.filter(
      (finca) => finca.tiene_produccion_leche,
    ).length;

    return {
      total_vacas_ordeño: totalVacasOrdeño,
      total_vacas_secas: totalVacasSecas,
      total_terneros: totalTerneros,
      total_bovinos: totalBovinos,
      fincas_con_produccion_leche: fincasConProduccionLeche,
      fincas: fincasData,
    };
  }

  //CITAS
  async getTotalCitas(cliente: Cliente) {
    return await this.citasRepository.count({
      where: {
        cliente: { id: cliente.id },
        estado: EstadoCita.COMPLETADA,
      },
    });
  }
}
