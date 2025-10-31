import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateFacturaEncabezadoDto } from './dto/create-factura_encabezado.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { RangoFactura } from 'src/rangos-factura/entities/rango-factura.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  EstadoFactura,
  FacturaEncabezado,
} from './entities/factura_encabezado.entity';
import { FacturaDetalle } from 'src/factura_detalle/entities/factura_detalle.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { CreateFacturaDetalleDto } from 'src/factura_detalle/dto/create-factura_detalle.dto';
import { Pai } from 'src/pais/entities/pai.entity';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';
import { UpdateFacturaEncabezadoDto } from './dto/update-factura-encabezado.dto';
import { Producto } from 'src/interfaces/response-productos.interface';
import { DescuentosCliente } from 'src/descuentos_clientes/entities/descuentos_cliente.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import {
  MovimientosLote,
  TipoMovimiento,
} from 'src/movimientos_lotes/entities/movimientos_lote.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';

@Injectable()
export class FacturaEncabezadoService {
  constructor(
    @InjectRepository(FacturaEncabezado)
    private readonly facturaEncabezadoRepository: Repository<FacturaEncabezado>,
    @InjectRepository(FacturaDetalle)
    private readonly facturaDetalleRepository: Repository<FacturaDetalle>,
    @InjectRepository(RangoFactura)
    private readonly rangoFacturaRepository: Repository<RangoFactura>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(SubServicio)
    private readonly subServicioRepository: Repository<SubServicio>,
    @InjectRepository(Lote)
    private readonly lote_producto_Repository: Repository<Lote>,
    @InjectRepository(MovimientosLote)
    private readonly movimientoLoteRepository: Repository<MovimientosLote>,
    private dataSource: DataSource,
  ) {}
  async create(
    user: User,
    createFacturaEncabezadoDto: CreateFacturaEncabezadoDto,
  ) {
    const usuario_id = user.id;
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const cliente = await transactionalEntityManager.findOne(Cliente, {
          where: { id: createFacturaEncabezadoDto.id_cliente },
        });

        if (!cliente) {
          throw new NotFoundException('Cliente no encontrado');
        }

        const pais = await transactionalEntityManager.findOne(Pai, {
          where: { id: createFacturaEncabezadoDto.pais_id },
        });

        if (!pais) {
          throw new NotFoundException('Pais no encontrado');
        }

        const sucursal = await transactionalEntityManager.findOne(Sucursal, {
          where: { id: createFacturaEncabezadoDto.sucursal_id },
        });

        if (!sucursal) {
          throw new NotFoundException('Sucursal no encontrado');
        }

        let descuento = null;
        if (createFacturaEncabezadoDto.descuento_id) {
          descuento = await transactionalEntityManager.findOne(
            DescuentosCliente,
            {
              where: { id: createFacturaEncabezadoDto.descuento_id },
            },
          );

          if (!descuento) {
            throw new NotFoundException('Descuento no encontrado');
          }
        }

        const rangoActivo = await transactionalEntityManager.findOne(
          RangoFactura,
          {
            where: { is_active: true },
          },
        );

        if (!rangoActivo) {
          throw new NotFoundException(
            'No hay rango de factura activo disponible',
          );
        }

        if (rangoActivo.correlativo_actual > rangoActivo.rango_final) {
          throw new BadRequestException('Rango de factura agotado');
        }

        const hoy = new Date();
        if (hoy > rangoActivo.fecha_limite_emision) {
          throw new BadRequestException(
            'La fecha límite de emisión ha expirado',
          );
        }

        const numeroFactura = `${
          rangoActivo.prefijo
        }-${rangoActivo.correlativo_actual.toString().padStart(8, '0')}`;

        const rangoAutorizado = `${rangoActivo.rango_inicial
          .toString()
          .padStart(8, '0')}-${rangoActivo.rango_final
          .toString()
          .padStart(8, '0')}-01-${rangoActivo.cai.substring(0, 8)}`;

        const { detalles, totales } = await this.procesarDetallesFactura(
          createFacturaEncabezadoDto.detalles,
          transactionalEntityManager,
        );

        const totalSinDescuento =
          totales.subTotal + totales.isv15 + totales.isv18;

        let totalConDescuento = totalSinDescuento;
        let montoDescuento = 0;

        if (descuento) {
          montoDescuento = totalSinDescuento * (descuento.porcentaje / 100);
          totalConDescuento = totalSinDescuento - montoDescuento;
        }

        const facturaData: any = {
          ...createFacturaEncabezadoDto,
          pais,
          cliente,
          usuario_id,
          sucursal,
          numero_factura: numeroFactura,
          fecha_limite_emision: rangoActivo.fecha_limite_emision,
          fecha_recepcion: rangoActivo.fecha_recepcion,
          rango_autorizado: rangoAutorizado,
          cai: rangoActivo.cai,
          rango_factura: rangoActivo,
          sub_total: totales.subTotal,
          importe_gravado_15: totales.importeGravado15,
          importe_gravado_18: totales.importeGravado18,
          isv_15: totales.isv15,
          isv_18: totales.isv18,

          descuentos_rebajas: montoDescuento,
          total: totalConDescuento,
          total_letras: this.convertirNumeroALetras(totalConDescuento),
        };

        if (descuento) {
          facturaData.descuento = descuento;
        }

        const factura = transactionalEntityManager.create(
          FacturaEncabezado,
          facturaData,
        );

        const facturaGuardada = await transactionalEntityManager.save(factura);

        const detallesEntities = detalles.map((detalleDto) => {
          const detalle = transactionalEntityManager.create(FacturaDetalle, {
            ...detalleDto,
            id_factura: facturaGuardada.id,
          });
          detalle.calcularTotal();
          return detalle;
        });

        await transactionalEntityManager.save(FacturaDetalle, detallesEntities);

        await transactionalEntityManager.increment(
          RangoFactura,
          { id: rangoActivo.id },
          'correlativo_actual',
          1,
        );

        return await transactionalEntityManager.findOne(FacturaEncabezado, {
          where: { id: facturaGuardada.id },
          relations: [
            'detalles',
            'detalles.producto_servicio',
            'cliente',
            'descuento',
          ],
        });
      },
    );
  }

  async procesarFactura(id: string): Promise<FacturaEncabezado> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const factura = await transactionalEntityManager.findOne(
          FacturaEncabezado,
          {
            where: { id },
            relations: ['detalles', 'detalles.producto_servicio'],
          },
        );

        if (!factura) {
          throw new NotFoundException('Factura no encontrada');
        }

        if (factura.estado !== EstadoFactura.EMITIDA) {
          throw new BadRequestException(
            `La factura no puede ser procesada. Estado actual: ${factura.estado}`,
          );
        }

        for (const detalle of factura.detalles) {
          if (detalle.producto_servicio?.tipo === 'producto') {
            await this.procesarProductoConFactura(
              detalle.id_producto_servicio,
              detalle.cantidad,
              factura.id,
              transactionalEntityManager,
            );
          }
        }

        factura.estado = EstadoFactura.PROCESADA;
        const facturaActualizada = await transactionalEntityManager.save(
          factura,
        );

        return facturaActualizada;
      },
    );
  }

  private async procesarProductoConFactura(
    productoId: string,
    cantidadRequerida: number,
    facturaId: string,
    transactionalEntityManager: any,
  ): Promise<void> {
    let cantidadRestante = cantidadRequerida;

    const lotes = await transactionalEntityManager.find(Lote, {
      where: {
        id_producto: productoId,
        cantidad: MoreThan(0),
      },
      order: { created_at: 'ASC' },
    });

    if (lotes.length === 0) {
      throw new BadRequestException(
        `No hay lotes disponibles para el producto ${productoId}`,
      );
    }

    const existenciaTotal = lotes.reduce(
      (total, lote) => total + Number(lote.cantidad),
      0,
    );

    if (existenciaTotal < cantidadRequerida) {
      throw new BadRequestException(
        `Existencia insuficiente para el producto ${productoId}. ` +
          `Requiere: ${cantidadRequerida}, Disponible: ${existenciaTotal}`,
      );
    }

    for (const lote of lotes) {
      if (cantidadRestante <= 0) break;

      const cantidadDisponible = Number(lote.cantidad);

      if (cantidadDisponible > 0) {
        const cantidadADescontar = Math.min(
          cantidadDisponible,
          cantidadRestante,
        );

        const cantidadAnterior = lote.cantidad;
        lote.cantidad = cantidadDisponible - cantidadADescontar;
        await transactionalEntityManager.save(Lote, lote);

        await this.registrarMovimientoLote(
          lote.id,
          productoId,
          cantidadADescontar,
          cantidadAnterior,
          lote.cantidad,
          TipoMovimiento.SALIDA,
          transactionalEntityManager,
          facturaId,
          'Venta de producto',
        );

        cantidadRestante -= cantidadADescontar;
      }
    }

    if (cantidadRestante > 0) {
      throw new BadRequestException(
        `Error al procesar el producto ${productoId}. ` +
          `No se pudo descontar completamente la cantidad requerida.`,
      );
    }
  }

  private async registrarMovimientoLote(
    loteId: string,
    productoId: string,
    cantidad: number,
    cantidadAnterior: number,
    cantidadNueva: number,
    tipo: TipoMovimiento,
    transactionalEntityManager: any,
    facturaId?: string,
    descripcion?: string,
  ): Promise<void> {
    const movimiento = transactionalEntityManager.create(MovimientosLote, {
      lote_id: loteId,
      producto_id: productoId,
      factura_id: facturaId,
      cantidad: tipo === TipoMovimiento.SALIDA ? -cantidad : cantidad,
      tipo,
      descripcion,
      cantidad_anterior: cantidadAnterior,
      cantidad_nueva: cantidadNueva,
    });

    await transactionalEntityManager.save(MovimientosLote, movimiento);
  }

  async verificarExistenciaParaFactura(
    id: string,
  ): Promise<{ suficiente: boolean; detalles: any[] }> {
    const factura = await this.facturaEncabezadoRepository.findOne({
      where: { id },
      relations: ['detalles', 'detalles.producto_servicio'],
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const resultados = [];

    for (const detalle of factura.detalles) {
      if (detalle.producto_servicio?.tipo === 'producto') {
        const existencia = await this.obtenerExistenciaProducto(
          detalle.id_producto_servicio,
        );
        const suficiente = existencia >= detalle.cantidad;

        resultados.push({
          productoId: detalle.id_producto_servicio,
          productoNombre: detalle.producto_servicio.nombre,
          cantidadRequerida: detalle.cantidad,
          existenciaDisponible: existencia,
          suficiente,
        });
      } else {
        resultados.push({
          productoId: detalle.id_producto_servicio,
          productoNombre: detalle.producto_servicio.nombre,
          tipo: 'servicio',
          cantidadRequerida: detalle.cantidad,
          existenciaDisponible: null,
          suficiente: true,
        });
      }
    }

    const existenciaSuficiente = resultados.every(
      (result) => result.suficiente,
    );

    return {
      suficiente: existenciaSuficiente,
      detalles: resultados,
    };
  }

  private async obtenerExistenciaProducto(productoId: string): Promise<number> {
    const lotes = await this.lote_producto_Repository.find({
      where: {
        id_producto: productoId,
        cantidad: MoreThan(0),
      },
    });

    return lotes.reduce((total, lote) => total + Number(lote.cantidad), 0);
  }

  async autorizarCancelacion(
    id: string,
    user: User,
  ): Promise<FacturaEncabezado> {
    if (!['Administrador'].includes(user.role.name)) {
      throw new UnauthorizedException(
        'No tiene permisos para autorizar cancelaciones.',
      );
    }

    const factura = await this.facturaEncabezadoRepository.findOne({
      where: { id },
      relations: ['usuario', 'sucursal'],
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    if (factura.estado !== EstadoFactura.PROCESADA) {
      throw new BadRequestException(
        'Solo se pueden autorizar cancelaciones de facturas procesadas.',
      );
    }

    factura.autorizada_cancelacion = true;
    factura.fecha_autorizacion_cancelacion = new Date();

    return await this.facturaEncabezadoRepository.save(factura);
  }

  async desautorizarCancelacion(
    id: string,
    user: User,
  ): Promise<FacturaEncabezado> {
    if (!['Administrador'].includes(user.role.name)) {
      throw new UnauthorizedException(
        'No tiene permisos para desautorizar cancelaciones.',
      );
    }

    const factura = await this.facturaEncabezadoRepository.findOne({
      where: { id },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    factura.autorizada_cancelacion = false;

    return await this.facturaEncabezadoRepository.save(factura);
  }

  async cancelarFactura(id: string, user: User): Promise<FacturaEncabezado> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const factura = await transactionalEntityManager.findOne(
          FacturaEncabezado,
          {
            where: { id },
            relations: ['detalles', 'detalles.producto_servicio'],
          },
        );

        if (!factura) {
          throw new NotFoundException('Factura no encontrada');
        }

        if (factura.estado !== EstadoFactura.PROCESADA) {
          throw new BadRequestException(
            `Solo se pueden cancelar facturas procesadas. Estado actual: ${factura.estado}`,
          );
        }

        this.validarCancelacionMismoDia(factura.created_at);
        this.validarAutorizacionCancelacion(factura, user);

        const movimientosOriginales = await transactionalEntityManager.find(
          MovimientosLote,
          {
            where: {
              factura_id: id,
              tipo: TipoMovimiento.SALIDA,
            },
            relations: ['lote'],
          },
        );

        if (movimientosOriginales.length === 0) {
          throw new BadRequestException(
            'No se encontraron registros de los movimientos originales de esta factura',
          );
        }

        const cantidadesFactura = new Map<string, number>();
        for (const detalle of factura.detalles) {
          if (detalle.producto_servicio?.tipo === 'producto') {
            cantidadesFactura.set(
              detalle.id_producto_servicio,
              detalle.cantidad,
            );
          }
        }

        for (const movimiento of movimientosOriginales) {
          const cantidadFactura = cantidadesFactura.get(movimiento.producto_id);

          await this.devolverProductoALoteOriginal(
            movimiento,
            transactionalEntityManager,
            factura.id,
            cantidadFactura,
          );
        }

        factura.estado = EstadoFactura.CANCELADA;
        const facturaCancelada = await transactionalEntityManager.save(factura);

        return facturaCancelada;
      },
    );
  }

  private validarAutorizacionCancelacion(
    factura: FacturaEncabezado,
    user: User,
  ): void {
    if (user.role.name === 'Administrador') {
      return;
    }

    if (!factura.autorizada_cancelacion) {
      throw new BadRequestException(
        'Esta factura no está autorizada para cancelación. Solicite la autorización con el administrador.',
      );
    }

    if (factura.fecha_autorizacion_cancelacion) {
      this.validarVigenciaAutorizacion(factura.fecha_autorizacion_cancelacion);
    }

    if (factura.usuario_id !== user.id) {
      throw new UnauthorizedException(
        'Solo puede cancelar sus propias facturas.',
      );
    }

    if (factura.sucursal_id !== user.sucursal?.id) {
      throw new UnauthorizedException(
        'Solo puede cancelar facturas de su sucursal.',
      );
    }

    this.validarTiempoCancelacion(factura.created_at);
  }

  private validarVigenciaAutorizacion(fechaAutorizacion: Date): void {
    const ahora = new Date();
    const vigenciaHoras = 24;
    const tiempoTranscurrido = ahora.getTime() - fechaAutorizacion.getTime();
    const tiempoLimiteMs = vigenciaHoras * 60 * 60 * 1000;

    if (tiempoTranscurrido > tiempoLimiteMs) {
      throw new BadRequestException(
        'La autorización de cancelación ha expirado. Solicite una nueva autorización.',
      );
    }
  }

  private validarCancelacionMismoDia(fechaCreacion: Date): void {
    const hoy = new Date();
    const fechaFactura = new Date(fechaCreacion);

    const hoyNormalizado = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );
    const fechaFacturaNormalizada = new Date(
      fechaFactura.getFullYear(),
      fechaFactura.getMonth(),
      fechaFactura.getDate(),
    );

    if (hoyNormalizado.getTime() !== fechaFacturaNormalizada.getTime()) {
      throw new BadRequestException(
        'Solo se pueden cancelar facturas el mismo día en que fueron generadas',
      );
    }
  }

  private validarTiempoCancelacion(fechaCreacion: Date): void {
    const ahora = new Date();
    const fechaFactura = new Date(fechaCreacion);

    const tiempoLimiteMs = 3 * 60 * 60 * 1000;
    const tiempoTranscurrido = ahora.getTime() - fechaFactura.getTime();

    if (tiempoTranscurrido > tiempoLimiteMs) {
      throw new BadRequestException(
        'Ha excedido el tiempo límite para cancelar esta factura. Contacte a un administrador.',
      );
    }
  }

  private agruparMovimientosPorProducto(
    movimientos: MovimientosLote[],
  ): Map<string, number> {
    const agrupados = new Map<string, number>();

    for (const movimiento of movimientos) {
      const cantidadActual = agrupados.get(movimiento.producto_id) || 0;
      agrupados.set(
        movimiento.producto_id,
        cantidadActual + Math.abs(movimiento.cantidad),
      );
    }

    return agrupados;
  }

  private async validarMovimientosConFactura(
    movimientosPorProducto: Map<string, number>,
    detallesFactura: FacturaDetalle[],
  ): Promise<void> {
    for (const detalle of detallesFactura) {
      if (detalle.producto_servicio?.tipo === 'producto') {
        const cantidadMovimientos =
          movimientosPorProducto.get(detalle.id_producto_servicio) || 0;

        if (Math.abs(cantidadMovimientos) !== detalle.cantidad) {
          throw new BadRequestException(
            `Inconsistencia en los movimientos del producto ${detalle.producto_servicio.nombre}. ` +
              `Factura: ${detalle.cantidad}, Movimientos: ${cantidadMovimientos}`,
          );
        }
      }
    }
  }

  private async devolverProductoALoteOriginal(
    movimientoOriginal: MovimientosLote,
    transactionalEntityManager: any,
    facturaId: string,
    cantidadFactura?: number,
  ): Promise<void> {
    const lote = await transactionalEntityManager.findOne(Lote, {
      where: { id: movimientoOriginal.lote_id },
    });

    if (!lote) {
      throw new NotFoundException(
        `Lote original ${movimientoOriginal.lote_id} no encontrado`,
      );
    }

    const cantidadADevolver =
      cantidadFactura || Math.abs(movimientoOriginal.cantidad);
    const cantidadAnterior = lote.cantidad;

    lote.cantidad = Number(lote.cantidad) + cantidadADevolver;
    await transactionalEntityManager.save(Lote, lote);

    await this.registrarMovimientoLote(
      movimientoOriginal.lote_id,
      movimientoOriginal.producto_id,
      cantidadADevolver,
      cantidadAnterior,
      lote.cantidad,
      TipoMovimiento.DEVOLUCION,
      transactionalEntityManager,
      facturaId,
      'Devolución por cancelación de factura',
    );
  }
  async obtenerHistorialMovimientosFactura(
    id: string,
  ): Promise<MovimientosLote[]> {
    const factura = await this.facturaEncabezadoRepository.findOne({
      where: { id },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    return await this.movimientoLoteRepository.find({
      where: { factura_id: id },
      relations: ['lote', 'producto'],
      order: { fecha: 'ASC' },
    });
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      sucursal,
      fechaInicio,
      fechaFin,
    } = paginationDto;
    const paisId = user.pais.id;

    try {
      const queryBuilder = this.facturaEncabezadoRepository
        .createQueryBuilder('factura')
        .leftJoinAndSelect('factura.cliente', 'cliente')
        .leftJoinAndSelect('factura.rango_factura', 'rango')
        .leftJoinAndSelect('factura.pais', 'pais')
        .leftJoinAndSelect('factura.detalles', 'detalles')
        .leftJoinAndSelect('factura.descuento', 'descuento')
        .leftJoinAndSelect('factura.sucursal', 'sucursal')
        .leftJoinAndSelect('factura.usuario', 'usuario')
        .where('pais.id = :paisId', { paisId })
        .orderBy('factura.created_at', 'DESC')
        .skip(offset)
        .take(limit);

      if (sucursal) {
        queryBuilder.andWhere('sucursal.id = :sucursalId', {
          sucursalId: sucursal,
        });
      } else if (user.sucursal?.id) {
        queryBuilder.andWhere('sucursal.id = :sucursalId', {
          sucursalId: user.sucursal.id,
        });
      }

      if (fechaInicio && fechaFin) {
        queryBuilder.andWhere(
          'DATE(factura.created_at) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)',
          { fechaInicio, fechaFin },
        );
      } else if (fechaInicio) {
        queryBuilder.andWhere(
          'DATE(factura.created_at) >= DATE(:fechaInicio)',
          {
            fechaInicio,
          },
        );
      } else if (fechaFin) {
        queryBuilder.andWhere('DATE(factura.created_at) <= DATE(:fechaFin)', {
          fechaFin,
        });
      }

      const [facturas, total] = await queryBuilder.getManyAndCount();

      if (!facturas || facturas.length === 0) {
        throw new NotFoundException('No se encontraron facturas disponibles');
      }

      return {
        total,
        data: instanceToPlain(facturas),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllProcesadas(user: User, paginationDto: PaginationDto) {
    const { sucursal } = paginationDto;
    const paisId = user.pais.id;

    try {
      const queryBuilder = this.facturaEncabezadoRepository
        .createQueryBuilder('factura')
        .leftJoinAndSelect('factura.cliente', 'cliente')
        .leftJoinAndSelect('factura.rango_factura', 'rango')
        .leftJoinAndSelect('factura.pais', 'pais')
        .leftJoinAndSelect('factura.detalles', 'detalles')
        .leftJoinAndSelect('factura.descuento', 'descuento')
        .leftJoinAndSelect('factura.sucursal', 'sucursal')
        .leftJoinAndSelect('factura.usuario', 'usuario')
        .where('pais.id = :paisId', { paisId })
        .andWhere('factura.estado = :estado', {
          estado: EstadoFactura.PROCESADA,
        })
        .orderBy('factura.created_at', 'DESC');

      if (sucursal) {
        queryBuilder.andWhere('sucursal.id = :sucursalId', {
          sucursalId: sucursal,
        });
      } else if (user.sucursal?.id) {
        queryBuilder.andWhere('sucursal.id = :sucursalId', {
          sucursalId: user.sucursal.id,
        });
      }

      const [facturas] = await queryBuilder.getManyAndCount();

      if (!facturas || facturas.length === 0) {
        throw new NotFoundException('No se encontraron facturas disponibles');
      }

      return instanceToPlain(facturas);
    } catch (error) {
      throw error;
    }
  }

  private async procesarDetallesFactura(
    detallesDto: CreateFacturaDetalleDto[],
    transactionalEntityManager: any,
  ): Promise<{ detalles: CreateFacturaDetalleDto[]; totales: any }> {
    const totales = {
      subTotal: 0,
      importeGravado15: 0,
      importeGravado18: 0,
      isv15: 0,
      isv18: 0,
    };

    const detallesProcesados: CreateFacturaDetalleDto[] = [];

    for (const detalleDto of detallesDto) {
      const productoServicio: Producto =
        await transactionalEntityManager.findOne(SubServicio, {
          where: { id: detalleDto.id_producto_servicio },
          relations: ['tax'],
        });

      if (!productoServicio) {
        throw new NotFoundException(
          `Producto/Servicio con ID ${detalleDto.id_producto_servicio} no encontrado`,
        );
      }

      const totalDetalle = detalleDto.cantidad * detalleDto.precio;
      let tasaImpuesto = 0;

      if (productoServicio.tipo.toLowerCase() === 'producto') {
        if (productoServicio.tax?.porcentaje) {
          tasaImpuesto = Number(productoServicio.tax.porcentaje) / 100;
        } else {
          tasaImpuesto = 0.15;
        }
      } else {
        tasaImpuesto = 0;
      }

      const importeGravado = totalDetalle;
      const isv = totalDetalle * tasaImpuesto;

      if (tasaImpuesto === 0.15) {
        totales.importeGravado15 += importeGravado;
        totales.isv15 += isv;
      } else if (tasaImpuesto === 0.18) {
        totales.importeGravado18 += importeGravado;
        totales.isv18 += isv;
      }

      totales.subTotal += totalDetalle;

      detallesProcesados.push({
        ...detalleDto,
        total: totalDetalle,
      });
    }

    return { detalles: detallesProcesados, totales };
  }

  private convertirNumeroALetras(numero: number): string {
    const enteros = Math.floor(numero);
    const decimales = Math.round((numero - enteros) * 100);

    if (enteros === 0) {
      return `cero con ${decimales.toString().padStart(2, '0')}/100`;
    }

    let resultado = this.convertirEnterosALetras(enteros);

    if (decimales > 0) {
      resultado += ` con ${decimales.toString().padStart(2, '0')}/100`;
    } else {
      resultado += ' con 00/100';
    }

    return resultado;
  }

  private convertirEnterosALetras(numero: number): string {
    if (numero === 0) return 'cero';
    if (numero < 0)
      return 'menos ' + this.convertirEnterosALetras(Math.abs(numero));

    const unidades = [
      '',
      'uno',
      'dos',
      'tres',
      'cuatro',
      'cinco',
      'seis',
      'siete',
      'ocho',
      'nueve',
    ];
    const decenas = [
      '',
      'diez',
      'veinte',
      'treinta',
      'cuarenta',
      'cincuenta',
      'sesenta',
      'setenta',
      'ochenta',
      'noventa',
    ];
    const especiales = [
      'diez',
      'once',
      'doce',
      'trece',
      'catorce',
      'quince',
      'dieciséis',
      'diecisiete',
      'dieciocho',
      'diecinueve',
    ];
    const centenas = [
      '',
      'ciento',
      'doscientos',
      'trescientos',
      'cuatrocientos',
      'quinientos',
      'seiscientos',
      'setecientos',
      'ochocientos',
      'novecientos',
    ];

    if (numero === 100) return 'cien';
    if (numero === 1000) return 'mil';

    let resultado = '';

    if (numero < 10) {
      return unidades[numero];
    }

    if (numero < 20) {
      return especiales[numero - 10];
    }

    if (numero < 100) {
      const decena = Math.floor(numero / 10);
      const unidad = numero % 10;

      if (unidad === 0) {
        return decenas[decena];
      }

      if (decena === 2) {
        switch (unidad) {
          case 1:
            return 'veintiuno';
          case 2:
            return 'veintidós';
          case 3:
            return 'veintitrés';
          case 6:
            return 'veintiséis';
          default:
            return `veinti${unidades[unidad]}`;
        }
      }

      return `${decenas[decena]} y ${unidades[unidad]}`;
    }

    if (numero < 1000) {
      const centena = Math.floor(numero / 100);
      const resto = numero % 100;

      if (centena === 1 && resto === 0) return 'cien';
      if (resto === 0) return centenas[centena];

      return `${centenas[centena]} ${this.convertirEnterosALetras(resto)}`;
    }

    if (numero < 1000000) {
      const miles = Math.floor(numero / 1000);
      const resto = numero % 1000;

      const milesTexto =
        miles === 1 ? 'mil' : `${this.convertirEnterosALetras(miles)} mil`;

      if (resto === 0) return milesTexto;
      return `${milesTexto} ${this.convertirEnterosALetras(resto)}`;
    }

    if (numero < 1000000000) {
      const millones = Math.floor(numero / 1000000);
      const resto = numero % 1000000;

      const millonesTexto =
        millones === 1
          ? 'un millón'
          : `${this.convertirEnterosALetras(millones)} millones`;

      if (resto === 0) return millonesTexto;
      return `${millonesTexto} ${this.convertirEnterosALetras(resto)}`;
    }

    return 'Número demasiado grande';
  }

  async update(
    id: string,
    updateFacturaEncabezadoDto: UpdateFacturaEncabezadoDto,
  ) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const factura = await transactionalEntityManager.findOne(
          FacturaEncabezado,
          {
            where: { id },
            relations: ['cliente', 'pais', 'descuento'],
          },
        );

        if (!factura) {
          throw new NotFoundException('Factura no encontrada');
        }

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(FacturaDetalle)
          .where('id_factura = :idFactura', { idFactura: factura.id })
          .execute();

        if (updateFacturaEncabezadoDto.id_cliente) {
          const cliente = await transactionalEntityManager.findOne(Cliente, {
            where: { id: updateFacturaEncabezadoDto.id_cliente },
          });
          if (!cliente) {
            throw new NotFoundException('Cliente no encontrado');
          }
          factura.cliente = cliente;
          factura.id_cliente = updateFacturaEncabezadoDto.id_cliente;
        }

        if (updateFacturaEncabezadoDto.descuento_id !== undefined) {
          if (updateFacturaEncabezadoDto.descuento_id) {
            const descuento = await transactionalEntityManager.findOne(
              DescuentosCliente,
              {
                where: { id: updateFacturaEncabezadoDto.descuento_id },
              },
            );

            if (!descuento) {
              throw new NotFoundException('Descuento no encontrado');
            }
            factura.descuento = descuento;
          } else {
            factura.descuento = null;
          }
        }

        if (updateFacturaEncabezadoDto.forma_pago) {
          factura.forma_pago = updateFacturaEncabezadoDto.forma_pago;
        }

        if (updateFacturaEncabezadoDto.estado) {
          factura.estado = updateFacturaEncabezadoDto.estado;
        }

        const descuentoAnterior = factura.descuentos_rebajas || 0;
        const nuevoDescuento =
          updateFacturaEncabezadoDto.descuentos_rebajas || 0;
        factura.descuentos_rebajas = nuevoDescuento;

        let subtotal = factura.sub_total;
        let importeExento = factura.importe_exento || 0;
        let importeExonerado = factura.importe_exonerado || 0;

        if (
          updateFacturaEncabezadoDto.detalles &&
          updateFacturaEncabezadoDto.detalles.length > 0
        ) {
          const { detalles, totales } = await this.procesarDetallesFactura(
            updateFacturaEncabezadoDto.detalles,
            transactionalEntityManager,
          );

          subtotal = totales.subTotal;
          factura.sub_total = totales.subTotal;
          factura.importe_gravado_15 = totales.importeGravado15;
          factura.importe_gravado_18 = totales.importeGravado18;
          factura.isv_15 = totales.isv15;
          factura.isv_18 = totales.isv18;

          if (updateFacturaEncabezadoDto.importe_exento !== undefined) {
            importeExento = updateFacturaEncabezadoDto.importe_exento;
            factura.importe_exento = importeExento;
          }

          if (updateFacturaEncabezadoDto.importe_exonerado !== undefined) {
            importeExonerado = updateFacturaEncabezadoDto.importe_exonerado;
            factura.importe_exonerado = importeExonerado;
          }

          const nuevosDetalles = detalles.map((detalleDto) => {
            const detalle = transactionalEntityManager.create(FacturaDetalle, {
              ...detalleDto,
              id_factura: factura.id,
            });
            detalle.calcularTotal();
            return detalle;
          });

          await transactionalEntityManager.save(FacturaDetalle, nuevosDetalles);
        }

        const totalBruto = subtotal + factura.isv_15 + factura.isv_18;
        const totalConDescuento = totalBruto - nuevoDescuento;
        const totalFinal = totalConDescuento + importeExento + importeExonerado;

        factura.total = totalFinal;
        factura.total_letras = this.convertirNumeroALetras(totalFinal);

        const facturaActualizada = await transactionalEntityManager.save(
          factura,
        );

        return await transactionalEntityManager.findOne(FacturaEncabezado, {
          where: { id: facturaActualizada.id },
          relations: [
            'detalles',
            'detalles.producto_servicio',
            'cliente',
            'pais',
            'descuento',
          ],
        });
      },
    );
  }

  remove(id: string) {
    return `This action removes a #${id} facturaEncabezado`;
  }
}
