import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAgroFacturacionDto } from './dto/create-agro_facturacion.dto';
import { UpdateAgroFacturacionDto } from './dto/update-agro_facturacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AgroFacturacion } from './entities/agro_facturacion.entity';
import { AgroFacturaDetalle } from './entities/agro_factura_detalle.entity';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { AgroRangoFactura } from './entities/rangos-agro-factura.entity';
import { AgroCliente } from 'src/agro_clientes/entities/agro_cliente.entity';
import { LoteAgroProducto } from 'src/agro-compras-productos/entities/lote-agro-compra.entity';
import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';
import { AgroMovimientosLote } from 'src/movimientos_lotes/entities/agro_movimientos_lotes.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { convertirNumeroALetras } from 'src/helpers/convertir_numeros_letras';
import { DescuentosAgroCliente } from 'src/descuentos_clientes/entities/descuentos_clientes_agro.entity';
import { CreateAgroFacturaDetalleDto } from './dto/create-agro_factura_detalle.dto';
import { ProductoAgro } from 'src/interfaces/agro-producto/response-productos-agro.interface';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { instanceToPlain } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import {
  AccionFacturacion,
  AuditoriaFacturacion,
} from './entities/audit_facturacion.entity';
import { EstadoFactura } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { TipoMovimiento } from 'src/movimientos_lotes/entities/movimientos_lote.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import {
  validarCancelacionMismoDia,
  validarTiempoCancelacion,
  validarVigenciaAutorizacion,
} from 'src/helpers/funciones_facturacion';

@Injectable()
export class AgroFacturacionService {
  constructor(
    @InjectRepository(AgroFacturacion)
    private readonly facturaEncabezadoRepository: Repository<AgroFacturacion>,
    @InjectRepository(AgroFacturaDetalle)
    private readonly facturaDetalleRepository: Repository<AgroFacturaDetalle>,
    @InjectRepository(AgroRangoFactura)
    private readonly rangoFacturaRepository: Repository<AgroRangoFactura>,
    @InjectRepository(AgroCliente)
    private readonly clienteRepository: Repository<AgroCliente>,
    @InjectRepository(AgroProducto)
    private readonly subServicioRepository: Repository<AgroProducto>,
    @InjectRepository(LoteAgroProducto)
    private readonly lote_producto_Repository: Repository<LoteAgroProducto>,
    @InjectRepository(AgroMovimientosLote)
    private readonly movimientoLoteRepository: Repository<AgroMovimientosLote>,
    @InjectRepository(AuditoriaFacturacion)
    private readonly auditFacturacionRepo: Repository<AuditoriaFacturacion>,
    private readonly validationAgro: AgroservicioValidationService,
    private dataSource: DataSource,
  ) {}
  async create(
    empleado: EmpleadosAgro,
    createAgroFacturacionDto: CreateAgroFacturacionDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const cliente = await transactionalEntityManager.findOne(AgroCliente, {
          where: { id: createAgroFacturacionDto.id_cliente },
        });

        if (!cliente) {
          throw new NotFoundException('Cliente no encontrado');
        }

        const sucursal = await transactionalEntityManager.findOne(
          AgroSucursale,
          {
            where: { id: createAgroFacturacionDto.sucursal_id },
          },
        );

        if (!sucursal) {
          throw new NotFoundException('Sucursal no encontrado');
        }

        let descuento = null;
        if (createAgroFacturacionDto.descuento_id) {
          descuento = await transactionalEntityManager.findOne(
            DescuentosAgroCliente,
            {
              where: { id: createAgroFacturacionDto.descuento_id },
            },
          );

          if (!descuento) {
            throw new NotFoundException('Descuento no encontrado');
          }
        }

        const rangoActivo = await transactionalEntityManager.findOne(
          AgroRangoFactura,
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
          createAgroFacturacionDto.detalles,
          transactionalEntityManager,
        );

        const cargosExtra = createAgroFacturacionDto.cargos_extra || 0;

        const totalProductosServicios =
          totales.subTotal + totales.isv15 + totales.isv18;

        let totalConDescuento = totalProductosServicios;
        let montoDescuento = 0;

        if (descuento) {
          montoDescuento =
            totalProductosServicios * (descuento.porcentaje / 100);
          totalConDescuento = totalProductosServicios - montoDescuento;
        }

        const totalFinal = totalConDescuento + cargosExtra;

        const facturaData: any = {
          ...createAgroFacturacionDto,
          cliente,
          agroservicio: { id: agroservicio.id },
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
          total: totalFinal,
          total_letras: convertirNumeroALetras(totalFinal),
        };

        if (descuento) {
          facturaData.descuento = descuento;
        }

        const factura = transactionalEntityManager.create(
          AgroFacturacion,
          facturaData,
        );

        const facturaGuardada = await transactionalEntityManager.save(factura);

        const detallesEntities = detalles.map((detalleDto) => {
          const detalle = transactionalEntityManager.create(
            AgroFacturaDetalle,
            {
              ...detalleDto,
              id_factura: facturaGuardada.id,
            },
          );
          detalle.calcularTotal();
          return detalle;
        });

        await transactionalEntityManager.save(
          AgroFacturaDetalle,
          detallesEntities,
        );

        await transactionalEntityManager.increment(
          AgroRangoFactura,
          { id: rangoActivo.id },
          'correlativo_actual',
          1,
        );

        await transactionalEntityManager.save(
          AuditoriaFacturacion,
          transactionalEntityManager.create(AuditoriaFacturacion, {
            factura: facturaGuardada,
            productoId: facturaGuardada.id,
            accion: AccionFacturacion.CREAR,
            empleado,
            empleadoId: empleado.id,
          }),
        );

        return await transactionalEntityManager.findOne(AgroFacturacion, {
          where: { id: facturaGuardada.id },
          relations: ['detalles', 'detalles.producto', 'cliente', 'descuento'],
        });
      },
    );
  }

  private async procesarDetallesFactura(
    detallesDto: CreateAgroFacturaDetalleDto[],
    transactionalEntityManager: any,
  ): Promise<{ detalles: CreateAgroFacturaDetalleDto[]; totales: any }> {
    const totales = {
      subTotal: 0,
      importeGravado15: 0,
      importeGravado18: 0,
      isv15: 0,
      isv18: 0,
    };

    const detallesProcesados: CreateAgroFacturaDetalleDto[] = [];

    for (const detalleDto of detallesDto) {
      const productoServicio: ProductoAgro =
        await transactionalEntityManager.findOne(AgroProducto, {
          where: { id: detalleDto.id_producto },
          relations: ['tax'],
        });

      if (!productoServicio) {
        throw new NotFoundException(
          `Producto con ID ${detalleDto.id_producto} no encontrado`,
        );
      }

      const totalDetalle = detalleDto.cantidad * detalleDto.precio;
      let tasaImpuesto = 0;

      if (productoServicio.tax?.porcentaje) {
        tasaImpuesto = Number(productoServicio.tax.porcentaje) / 100;
      } else {
        tasaImpuesto = 0.15;
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

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      sucursal = '',
      fechaInicio = '',
      fechaFin = '',
    } = paginationDto;
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    try {
      const queryBuilder = this.facturaEncabezadoRepository
        .createQueryBuilder('factura')
        .leftJoinAndSelect('factura.cliente', 'cliente')
        .leftJoinAndSelect('factura.rango_factura', 'rango')
        .leftJoinAndSelect('factura.agroservicio', 'agroservicio')
        .leftJoinAndSelect('factura.detalles', 'detalles')
        .leftJoinAndSelect('factura.descuento', 'descuento')
        .leftJoinAndSelect('factura.sucursal', 'sucursal')
        .where('agroservicio.id = :agroservicioId', { agroservicioId })
        .orderBy('factura.created_at', 'DESC')
        .skip(offset)
        .take(limit);

      if (sucursal) {
        queryBuilder.andWhere('sucursal.id = :sucursalId', {
          sucursalId: sucursal,
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

  findOne(id: number) {
    return `This action returns a #${id} agroFacturacion`;
  }

  async update(
    id: string,
    updateFacturaEncabezadoDto: UpdateAgroFacturacionDto,
  ) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const factura = await transactionalEntityManager.findOne(
          AgroFacturacion,
          {
            where: { id },
            relations: ['cliente', 'agroservicio', 'descuento'],
          },
        );

        if (!factura) {
          throw new NotFoundException('Factura no encontrada');
        }

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(AgroFacturaDetalle)
          .where('id_factura = :idFactura', { idFactura: factura.id })
          .execute();

        if (updateFacturaEncabezadoDto.id_cliente) {
          const cliente = await transactionalEntityManager.findOne(
            AgroCliente,
            {
              where: { id: updateFacturaEncabezadoDto.id_cliente },
            },
          );
          if (!cliente) {
            throw new NotFoundException('Cliente no encontrado');
          }
          factura.id_cliente = updateFacturaEncabezadoDto.id_cliente;
        }

        if (updateFacturaEncabezadoDto.descuento_id !== undefined) {
          if (updateFacturaEncabezadoDto.descuento_id) {
            const descuento = await transactionalEntityManager.findOne(
              DescuentosAgroCliente,
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

        if (updateFacturaEncabezadoDto.cargos_extra !== undefined) {
          factura.cargos_extra = updateFacturaEncabezadoDto.cargos_extra;
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
            const detalle = transactionalEntityManager.create(
              AgroFacturaDetalle,
              {
                ...detalleDto,
                id_factura: factura.id,
              },
            );
            detalle.calcularTotal();
            return detalle;
          });

          await transactionalEntityManager.save(
            AgroFacturaDetalle,
            nuevosDetalles,
          );
        }

        const totalBruto = subtotal + factura.isv_15 + factura.isv_18;
        const totalConDescuento = totalBruto - nuevoDescuento;

        const cargosExtra =
          updateFacturaEncabezadoDto.cargos_extra !== undefined
            ? updateFacturaEncabezadoDto.cargos_extra
            : factura.cargos_extra;

        const totalFinal =
          totalConDescuento + importeExento + importeExonerado + cargosExtra;

        factura.total = totalFinal;
        factura.total_letras = convertirNumeroALetras(totalFinal);

        const facturaActualizada =
          await transactionalEntityManager.save(factura);

        return await transactionalEntityManager.findOne(AgroFacturacion, {
          where: { id: facturaActualizada.id },
          relations: [
            'detalles',
            'detalles.producto',
            'cliente',
            'agroservicio',
            'descuento',
          ],
        });
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} agroFacturacion`;
  }

  async procesarFactura(id: string): Promise<AgroFacturacion> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const factura = await transactionalEntityManager.findOne(
          AgroFacturacion,
          {
            where: { id },
            relations: ['detalles', 'detalles.producto'],
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
          if (detalle.producto) {
            await this.procesarProductoConFactura(
              detalle.id_producto,
              detalle.cantidad,
              factura.id,
              transactionalEntityManager,
            );
          }
        }

        factura.estado = EstadoFactura.PROCESADA;
        const facturaActualizada =
          await transactionalEntityManager.save(factura);

        return facturaActualizada;
      },
    );
  }

  async verificarExistenciaParaFactura(
    id: string,
  ): Promise<{ suficiente: boolean; detalles: any[] }> {
    const factura = await this.facturaEncabezadoRepository.findOne({
      where: { id },
      relations: ['detalles', 'detalles.producto'],
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const resultados = [];

    for (const detalle of factura.detalles) {
      if (detalle.producto) {
        const existencia = await this.obtenerExistenciaProducto(
          detalle.id_producto,
        );
        const suficiente = existencia >= detalle.cantidad;

        resultados.push({
          productoId: detalle.id_producto,
          productoNombre: detalle.producto.nombre,
          cantidadRequerida: detalle.cantidad,
          existenciaDisponible: existencia,
          suficiente,
        });
      } else {
        resultados.push({
          productoId: detalle.id_producto,
          productoNombre: detalle.producto.nombre,
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

  async autorizarCancelacion(
    id: string,
    cliente: Cliente,
  ): Promise<AgroFacturacion> {
    if (!cliente) {
      throw new UnauthorizedException(
        'No tiene permisos para autorizar cancelaciones.',
      );
    }

    const factura = await this.facturaEncabezadoRepository.findOne({
      where: { id },
      relations: ['sucursal'],
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

  async cancelarFactura(id: string): Promise<AgroFacturacion> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const factura = await transactionalEntityManager.findOne(
          AgroFacturacion,
          {
            where: { id },
            relations: ['detalles', 'detalles.producto'],
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

        validarCancelacionMismoDia(factura.created_at);
        this.validarAutorizacionCancelacion(factura);

        const movimientosOriginales = await transactionalEntityManager.find(
          AgroMovimientosLote,
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
          if (detalle.producto) {
            cantidadesFactura.set(detalle.id_producto, detalle.cantidad);
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

  private async procesarProductoConFactura(
    productoId: string,
    cantidadRequerida: number,
    facturaId: string,
    transactionalEntityManager: any,
  ): Promise<void> {
    let cantidadRestante = cantidadRequerida;

    const lotes = await transactionalEntityManager.find(LoteAgroProducto, {
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
        await transactionalEntityManager.save(LoteAgroProducto, lote);

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
    const movimiento = transactionalEntityManager.create(AgroMovimientosLote, {
      lote_id: loteId,
      producto_id: productoId,
      factura_id: facturaId,
      cantidad: tipo === TipoMovimiento.SALIDA ? -cantidad : cantidad,
      tipo,
      descripcion,
      cantidad_anterior: cantidadAnterior,
      cantidad_nueva: cantidadNueva,
    });

    await transactionalEntityManager.save(AgroMovimientosLote, movimiento);
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

  private async devolverProductoALoteOriginal(
    movimientoOriginal: AgroMovimientosLote,
    transactionalEntityManager: any,
    facturaId: string,
    cantidadFactura?: number,
  ): Promise<void> {
    const lote = await transactionalEntityManager.findOne(LoteAgroProducto, {
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
    await transactionalEntityManager.save(LoteAgroProducto, lote);

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

  private validarAutorizacionCancelacion(factura: AgroFacturacion): void {
    if (!factura.autorizada_cancelacion) {
      throw new BadRequestException(
        'Esta factura no está autorizada para cancelación. Solicite la autorización con el administrador.',
      );
    }

    if (factura.fecha_autorizacion_cancelacion) {
      validarVigenciaAutorizacion(factura.fecha_autorizacion_cancelacion);
    }

    validarTiempoCancelacion(factura.created_at);
  }
}
