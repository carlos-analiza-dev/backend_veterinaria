import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Res,
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
import { ProductoAgro } from 'src/interfaces/agro-producto/Response-productos-agro.interface';
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
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import * as path from 'path';
import { Response } from 'express';
import { MailService } from 'src/mail/mail.service';
const PDFDocument = require('pdfkit');

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
    @InjectRepository(DatosAgroservicio)
    private readonly datosAgroRepository: Repository<DatosAgroservicio>,
    private readonly mailService: MailService,
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

        let subTotalConDescuento = totales.subTotal;
        let montoDescuento = 0;

        if (descuento) {
          montoDescuento =
            totales.subTotal * (Number(descuento.porcentaje) / 100);

          subTotalConDescuento = totales.subTotal - montoDescuento;
        }

        const factorDescuento =
          totales.subTotal > 0 ? subTotalConDescuento / totales.subTotal : 1;

        const importeGravado15 = totales.importeGravado15 * factorDescuento;
        const importeGravado18 = totales.importeGravado18 * factorDescuento;
        const importeExento =
          Number(totales.importeExento || 0) * factorDescuento;

        const importeExonerado =
          Number(totales.importeExonerado || 0) * factorDescuento;

        const isv15 = importeGravado15 * 0.15;
        const isv18 = importeGravado18 * 0.18;

        const totalFinal = subTotalConDescuento + isv15 + isv18 + cargosExtra;

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

          sub_total: subTotalConDescuento,

          importe_exento: importeExento ?? 0,
          importe_exonerado: importeExonerado ?? 0,
          importe_gravado_15: importeGravado15 ?? 0,
          importe_gravado_18: importeGravado18 ?? 0,

          isv_15: isv15 ?? 0,
          isv_18: isv18 ?? 0,

          descuentos_rebajas: montoDescuento,
          cargos_extra: cargosExtra,
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
            facturaId: facturaGuardada.id,
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
        .leftJoinAndSelect('detalles.producto', 'producto')
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

  async findAllProcesadas(propieparioId: string, paginationDto: PaginationDto) {
    const { sucursal } = paginationDto;
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propieparioId);
    const agroservicioId = agroservicio.id ?? '';

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
        .andWhere('factura.estado = :estado', {
          estado: EstadoFactura.PROCESADA,
        })
        .orderBy('factura.created_at', 'DESC');

      if (sucursal) {
        queryBuilder.andWhere('sucursal.id = :sucursalId', {
          sucursalId: sucursal,
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

  async findProductosFrecuentes(
    clienteId: string,
    paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const clienteExiste = await this.facturaEncabezadoRepository
        .createQueryBuilder('factura')
        .where('factura.id_cliente = :clienteId', { clienteId })
        .andWhere('factura.estado = :estado', {
          estado: EstadoFactura.PROCESADA,
        })
        .getExists();

      if (!clienteExiste) {
        throw new NotFoundException(
          `No se encontraron facturas procesadas para el cliente con ID: ${clienteId}`,
        );
      }

      const totalQuery = this.facturaDetalleRepository
        .createQueryBuilder('detalle')
        .innerJoin('detalle.factura', 'factura')
        .where('factura.id_cliente = :clienteId', { clienteId })
        .andWhere('factura.estado = :estado', {
          estado: EstadoFactura.PROCESADA,
        })
        .select('COUNT(DISTINCT detalle.id_producto)', 'total');

      const totalResult = await totalQuery.getRawOne();
      const total = parseInt(totalResult.total) || 0;

      const resultados = await this.facturaDetalleRepository
        .createQueryBuilder('detalle')
        .innerJoin('detalle.factura', 'factura')
        .innerJoinAndSelect('detalle.producto', 'producto')
        .where('factura.id_cliente = :clienteId', { clienteId })
        .andWhere('factura.estado = :estado', {
          estado: EstadoFactura.PROCESADA,
        })
        .select([
          'producto.id AS id',
          'producto.nombre AS nombre',
          'producto.codigo AS codigo',
          'producto.precio AS precio_actual',
          'producto.categoriaId AS categoria',
          'SUM(detalle.cantidad) AS total_cantidad',
          'COUNT(DISTINCT factura.id) AS total_facturas',
          'SUM(detalle.total) AS total_monto',
          'AVG(detalle.cantidad) AS promedio_por_factura',
          'MAX(factura.fecha_recepcion) AS ultima_compra',
          'MIN(factura.fecha_recepcion) AS primera_compra',
        ])
        .groupBy('producto.id')
        .addGroupBy('producto.nombre')
        .addGroupBy('producto.codigo')
        .addGroupBy('producto.precio')
        .addGroupBy('producto.categoriaId')
        .orderBy('total_cantidad', 'DESC')
        .addOrderBy('total_facturas', 'DESC')
        .limit(limit)
        .offset(offset)
        .getRawMany();

      const productos = resultados.map((item) => {
        const totalCantidad = parseInt(item.total_cantidad) || 0;
        const totalFacturas = parseInt(item.total_facturas) || 0;
        const promedioPorFactura = parseFloat(item.promedio_por_factura) || 0;

        const frecuencia =
          totalFacturas > 0 ? totalCantidad / totalFacturas : 0;

        return {
          id: item.id,
          nombre: item.nombre,
          codigo: item.codigo || 'N/A',
          precio_actual: parseFloat(item.precio_actual) || 0,
          categoria: item.categoria || 'Sin categoría',
          estadisticas: {
            total_comprado: totalCantidad,
            total_facturas: totalFacturas,
            total_monto: parseFloat(item.total_monto) || 0,
            promedio_por_factura: promedioPorFactura,
            frecuencia_compra: parseFloat(frecuencia.toFixed(2)),
            primera_compra: item.primera_compra,
            ultima_compra: item.ultima_compra,
          },
        };
      });

      const estadisticasGenerales =
        await this.calcularEstadisticasGenerales(clienteId);

      return {
        data: productos,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + productos.length < total,
        },
        estadisticas_generales: estadisticasGenerales,
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
    empleado: EmpleadosAgro,
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
          factura.cliente = cliente;
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
            factura.descuentos_rebajas =
              updateFacturaEncabezadoDto.descuentos_rebajas || 0;
          } else {
            factura.descuento = null;
            factura.descuentos_rebajas = 0;
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

        if (updateFacturaEncabezadoDto.importe_exento !== undefined) {
          factura.importe_exento = updateFacturaEncabezadoDto.importe_exento;
        }

        if (updateFacturaEncabezadoDto.importe_exonerado !== undefined) {
          factura.importe_exonerado =
            updateFacturaEncabezadoDto.importe_exonerado;
        }

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(AgroFacturaDetalle)
          .where('id_factura = :idFactura', { idFactura: factura.id })
          .execute();

        let subtotal = factura.sub_total || 0;
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

        const cargosExtra = factura.cargos_extra || 0;

        let subTotalConDescuento = subtotal;
        let montoDescuento = 0;

        if (factura.descuento) {
          montoDescuento =
            subtotal * (Number(factura.descuento.porcentaje) / 100);

          subTotalConDescuento = subtotal - montoDescuento;
        }

        const factorDescuento =
          subtotal > 0 ? subTotalConDescuento / subtotal : 1;

        const importeGravado15 =
          Number(factura.importe_gravado_15 || 0) * factorDescuento;

        const importeGravado18 =
          Number(factura.importe_gravado_18 || 0) * factorDescuento;

        const isv15 = importeGravado15 * 0.15;
        const isv18 = importeGravado18 * 0.18;

        factura.sub_total = subTotalConDescuento;
        factura.importe_gravado_15 = importeGravado15;
        factura.importe_gravado_18 = importeGravado18;
        factura.isv_15 = isv15;
        factura.isv_18 = isv18;
        factura.descuentos_rebajas = montoDescuento;

        const totalFinal =
          subTotalConDescuento +
          isv15 +
          isv18 +
          importeExento +
          importeExonerado +
          cargosExtra;

        factura.total = totalFinal;
        factura.total_letras = convertirNumeroALetras(totalFinal);

        const facturaActualizada =
          await transactionalEntityManager.save(factura);

        await transactionalEntityManager.save(
          AuditoriaFacturacion,
          transactionalEntityManager.create(AuditoriaFacturacion, {
            factura: facturaActualizada,
            facturaId: facturaActualizada.id,
            accion: AccionFacturacion.ACTUALIZAR,
            empleado,
            empleadoId: empleado.id,
          }),
        );

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
            relations: ['detalles', 'detalles.producto', 'cliente'],
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

        const agroservicioId = factura.agroservicioId;

        this.enviarFacturaPorCorreo(facturaActualizada, agroservicioId).catch(
          (error) => {
            console.error('Error en envío de factura por correo:', error);
          },
        );

        return facturaActualizada;
      },
    );
  }

  async verificarExistenciaParaFactura(
    id: string,
    sucursalId: string,
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
          sucursalId,
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

  private async obtenerExistenciaProducto(
    productoId: string,
    sucursalId: string,
  ): Promise<number> {
    const lotes = await this.lote_producto_Repository.find({
      where: {
        id_producto: productoId,
        cantidad: MoreThan(0),
        sucursal: { id: sucursalId },
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

  private async calcularEstadisticasGenerales(clienteId: string) {
    const estadisticas = await this.facturaEncabezadoRepository
      .createQueryBuilder('factura')
      .where('factura.id_cliente = :clienteId', { clienteId })
      .andWhere('factura.estado = :estado', { estado: EstadoFactura.PROCESADA })
      .select([
        'COUNT(factura.id) AS total_facturas',
        'SUM(factura.total) AS total_gastado',
        'AVG(factura.total) AS promedio_factura',
        'MIN(factura.fecha_recepcion) AS primera_compra',
        'MAX(factura.fecha_recepcion) AS ultima_compra',
        'SUM(factura.sub_total) AS total_subtotal',
        'SUM(factura.isv_15 + factura.isv_18) AS total_isv',
      ])
      .getRawOne();

    const totalProductosUnicos = await this.facturaDetalleRepository
      .createQueryBuilder('detalle')
      .innerJoin('detalle.factura', 'factura')
      .where('factura.id_cliente = :clienteId', { clienteId })
      .andWhere('factura.estado = :estado', { estado: EstadoFactura.PROCESADA })
      .select('COUNT(DISTINCT detalle.id_producto)', 'total')
      .getRawOne();

    return {
      total_facturas: parseInt(estadisticas.total_facturas) || 0,
      total_gastado: parseFloat(estadisticas.total_gastado) || 0,
      promedio_factura: parseFloat(estadisticas.promedio_factura) || 0,
      total_productos_unicos: parseInt(totalProductosUnicos.total) || 0,
      primera_compra: estadisticas.primera_compra,
      ultima_compra: estadisticas.ultima_compra,
      total_subtotal: parseFloat(estadisticas.total_subtotal) || 0,
      total_isv: parseFloat(estadisticas.total_isv) || 0,
    };
  }

  private async generarPDFBuffer(
    facturaId: string,
    agroservicioId: string,
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const factura = await this.facturaEncabezadoRepository.findOne({
          where: { id: facturaId },
          relations: [
            'cliente',
            'detalles',
            'detalles.producto',
            'rango_factura',
          ],
        });

        if (!factura) {
          reject(new Error('Factura no encontrada'));
          return;
        }

        const agroservicio = await this.datosAgroRepository.findOne({
          where: { id: agroservicioId },
          relations: ['pais'],
        });

        if (!agroservicio) {
          reject(new Error('Datos de la empresa no encontrados'));
          return;
        }

        const simbolo = agroservicio.pais?.simbolo_moneda ?? '$';
        const buffers: Buffer[] = [];

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const formatDate = (date: any): string => {
          if (!date) return 'N/A';
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          };
          if (typeof date === 'string') {
            const [year, month, day] = date.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            return dateObj.toLocaleDateString('es-ES', options);
          }
          if (date instanceof Date) {
            return date.toLocaleDateString('es-ES', options);
          }
          return 'N/A';
        };

        const formatNumber = (num: number): string => {
          return new Intl.NumberFormat('es-HN').format(num);
        };

        const drawCell = (
          x: number,
          y: number,
          width: number,
          height: number,
          text: string,
          backgroundColor: string = '#FFFFFF',
          textColor: string = '#000000',
          fontSize: number = 8,
          bold: boolean = false,
        ) => {
          doc.rect(x, y, width, height).fillColor(backgroundColor).fill();
          doc.rect(x, y, width, height).strokeColor('#CCCCCC').stroke();
          doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
          doc
            .fontSize(fontSize)
            .fillColor(textColor)
            .text(text, x + 5, y + (height - fontSize) / 2, {
              width: width - 10,
              align: 'left',
            });
        };

        const drawCellRight = (
          x: number,
          y: number,
          width: number,
          height: number,
          text: string,
          backgroundColor: string = '#FFFFFF',
          textColor: string = '#000000',
          fontSize: number = 8,
          bold: boolean = false,
        ) => {
          doc.rect(x, y, width, height).fillColor(backgroundColor).fill();
          doc.rect(x, y, width, height).strokeColor('#CCCCCC').stroke();
          doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
          doc
            .fontSize(fontSize)
            .fillColor(textColor)
            .text(text, x, y + (height - fontSize) / 2, {
              width: width - 10,
              align: 'right',
            });
        };

        try {
          if (agroservicio.logo?.url) {
            const url = new URL(agroservicio.logo.url);
            const logoPath = path.join(
              process.cwd(),
              url.pathname.replace(/^\//, ''),
            );
            doc.image(logoPath, 400, 0, { width: 100 });
          }
        } catch (error) {
          console.warn('No se pudo cargar el logo');
        }

        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#000000')
          .text('Factura', 50, 60, { align: 'left' });

        doc.fontSize(10).font('Helvetica');
        doc.text(`No. de Factura ${factura.numero_factura}`, 50, 80);
        doc.text(`Fecha de Factura: ${formatDate(factura.created_at)}`, 50, 92);
        doc.text(
          `Fecha Limite de Emisión: ${formatDate(factura.fecha_limite_emision)}`,
          50,
          104,
        );
        doc.text(
          `Fecha de Recepción: ${formatDate(factura.fecha_recepcion)}`,
          50,
          116,
        );
        doc.text(
          `Rango Autorizado: ${factura.rango_factura.prefijo}-${factura.rango_factura.rango_inicial} hasta ${factura.rango_factura.prefijo}-${factura.rango_factura.rango_final}`,
          50,
          128,
        );

        const infoEmpresaY = 160;
        doc.fontSize(10);
        doc
          .font('Helvetica-Bold')
          .text(`Propietaria: ${agroservicio.propietario}`, 50, infoEmpresaY);
        doc
          .font('Helvetica')
          .text(agroservicio.direccion, 50, infoEmpresaY + 12);
        doc.text(`${agroservicio.correo}`, 50, infoEmpresaY + 24);
        doc.text(`RTN: ${agroservicio.rtn}`, 50, infoEmpresaY + 36);
        doc
          .font('Helvetica-Bold')
          .text(
            `Forma de Pago: ${factura.forma_pago === 'Credito' ? 'Crédito' : 'Contado'}`,
            50,
            infoEmpresaY + 48,
          );

        const tableTop = 220;
        const cellHeight = 20;
        const colWidths = [80, 220, 100, 100];

        drawCell(
          50,
          tableTop,
          500,
          cellHeight,
          'DATOS DEL CLIENTE',
          '#2E86AB',
          '#FFFFFF',
          10,
          true,
        );
        drawCell(
          50,
          tableTop + cellHeight,
          250,
          cellHeight,
          `Nombre: ${factura.cliente.nombre || 'Cliente'}`,
          '#F8F9FA',
        );
        drawCell(
          300,
          tableTop + cellHeight,
          250,
          cellHeight,
          `RTN: ${(factura.cliente as any).rtn || 'N/A'}`,
          '#F8F9FA',
        );
        drawCell(
          50,
          tableTop + cellHeight * 2,
          500,
          cellHeight,
          `Dirección: ${(factura.cliente as any).direccion || 'N/A'}`,
          '#FFFFFF',
        );
        drawCell(
          50,
          tableTop + cellHeight * 3,
          500,
          cellHeight,
          `Ciudad: ${(factura.cliente as any).ciudad || 'N/A'}`,
          '#F8F9FA',
        );

        const detallesTop = tableTop + cellHeight * 4 + 20;
        let currentY = detallesTop;

        drawCell(
          50,
          detallesTop,
          colWidths[0],
          cellHeight,
          'CANTIDAD',
          '#2E86AB',
          '#FFFFFF',
          9,
          true,
        );
        drawCell(
          130,
          detallesTop,
          colWidths[1],
          cellHeight,
          'DESCRIPCIÓN',
          '#2E86AB',
          '#FFFFFF',
          9,
          true,
        );
        drawCell(
          350,
          detallesTop,
          colWidths[2],
          cellHeight,
          'PRECIO UNITARIO',
          '#2E86AB',
          '#FFFFFF',
          9,
          true,
        );
        drawCell(
          450,
          detallesTop,
          colWidths[3],
          cellHeight,
          'TOTAL',
          '#2E86AB',
          '#FFFFFF',
          9,
          true,
        );

        currentY += cellHeight;

        factura.detalles.forEach((detalle, index) => {
          const backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
          drawCell(
            50,
            currentY,
            colWidths[0],
            cellHeight,
            detalle.cantidad.toString(),
            backgroundColor,
          );
          drawCell(
            130,
            currentY,
            colWidths[1],
            cellHeight,
            detalle.producto?.nombre || 'Producto',
            backgroundColor,
          );
          drawCellRight(
            350,
            currentY,
            colWidths[2],
            cellHeight,
            `${simbolo} ${formatNumber(Number(detalle.precio))}`,
            backgroundColor,
          );
          drawCellRight(
            450,
            currentY,
            colWidths[3],
            cellHeight,
            `${simbolo} ${formatNumber(Number(detalle.total))}`,
            backgroundColor,
          );
          currentY += cellHeight;
        });

        if (factura.cargos_extra && factura.cargos_extra > 0) {
          currentY += 10;
          drawCell(
            50,
            currentY,
            500,
            cellHeight,
            'CARGOS ADICIONALES',
            '#E9ECEF',
            '#000000',
            9,
            true,
          );
          currentY += cellHeight;
          drawCell(50, currentY, colWidths[0], cellHeight, '1', '#F8F9FA');
          drawCell(
            130,
            currentY,
            colWidths[1],
            cellHeight,
            'Cargo Extra',
            '#F8F9FA',
            '#000000',
            8,
            true,
          );
          drawCellRight(
            350,
            currentY,
            colWidths[2],
            cellHeight,
            `${simbolo} ${formatNumber(Number(factura.cargos_extra))}`,
            '#F8F9FA',
          );
          drawCellRight(
            450,
            currentY,
            colWidths[3],
            cellHeight,
            `${simbolo} ${formatNumber(Number(factura.cargos_extra))}`,
            '#F8F9FA',
          );
          currentY += cellHeight;
        }

        const resumenTop = currentY + 20;
        const resumenLeft = 350;
        const resumenCellHeight = 15;

        drawCell(
          50,
          resumenTop,
          280,
          30,
          'Firma Autorizada',
          '#E9ECEF',
          '#000000',
          9,
          true,
        );
        drawCell(
          50,
          resumenTop + 35,
          280,
          25,
          factura.total_letras || '(CANTIDAD EN LETRAS)',
          '#FFFFFF',
          '#000000',
          8,
        );

        drawCell(
          50,
          resumenTop + 65,
          280,
          resumenCellHeight,
          'No. Correlativo de Orden de Compra:',
          '#F8F9FA',
        );
        drawCell(
          50,
          resumenTop + 80,
          280,
          resumenCellHeight,
          'No. Correlativo de Constancia de Registro Exonerado:',
          '#FFFFFF',
        );
        drawCell(
          50,
          resumenTop + 95,
          280,
          resumenCellHeight,
          'No. Identificación del Registro de la SAG:',
          '#F8F9FA',
        );

        drawCell(
          50,
          resumenTop + 115,
          135,
          resumenCellHeight,
          'ORIGINAL: CLIENTE',
          '#2E86AB',
          '#FFFFFF',
          6,
          true,
        );
        drawCell(
          185,
          resumenTop + 115,
          145,
          resumenCellHeight,
          'COPIA: OBLIGADO TRIBUTARIO EMISOR',
          '#2E86AB',
          '#FFFFFF',
          6,
          true,
        );

        const totales = [
          { label: 'Subtotal', value: factura.sub_total },
          { label: 'Descuentos y Rebajas', value: factura.descuentos_rebajas },
          { label: 'Importe Exento', value: factura.importe_exento },
          { label: 'Importe Exonerado', value: factura.importe_exonerado },
          {
            label: 'Importe Gravado al 15%',
            value: factura.importe_gravado_15,
          },
          {
            label: 'Importe Gravado al 18%',
            value: factura.importe_gravado_18,
          },
          { label: 'ISV 15%', value: factura.isv_15 },
          { label: 'ISV 18%', value: factura.isv_18 },
          { label: 'Cargos Extra', value: factura.cargos_extra, bold: true },
        ];

        totales.forEach((item, index) => {
          const yPos = resumenTop + index * resumenCellHeight;
          drawCell(
            resumenLeft,
            yPos,
            80,
            resumenCellHeight,
            item.label,
            index % 2 === 0 ? '#FFFFFF' : '#F8F9FA',
            '#000000',
            6,
            (item as any).bold || false,
          );
          drawCellRight(
            430,
            yPos,
            120,
            resumenCellHeight,
            `${simbolo} ${formatNumber(Number(item.value))}`,
            index % 2 === 0 ? '#FFFFFF' : '#F8F9FA',
            '#000000',
            8,
            (item as any).bold || false,
          );
        });

        const totalY = resumenTop + totales.length * resumenCellHeight;
        drawCell(
          resumenLeft,
          totalY,
          80,
          resumenCellHeight + 5,
          'Total a Pagar',
          '#2E86AB',
          '#FFFFFF',
          9,
          true,
        );
        drawCellRight(
          430,
          totalY,
          120,
          resumenCellHeight + 5,
          `${simbolo} ${formatNumber(Number(factura.total))}`,
          '#2E86AB',
          '#FFFFFF',
          9,
          true,
        );

        const footerY = Math.max(totalY + resumenCellHeight + 30, 700);
        drawCell(
          50,
          footerY,
          500,
          25,
          'MUCHAS GRACIAS POR TU COMPRA!',
          '#2E86AB',
          '#FFFFFF',
          10,
          true,
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async enviarFacturaPorCorreo(
    factura: AgroFacturacion,
    agroservicioId: string,
  ): Promise<void> {
    try {
      if (!factura.cliente?.email) {
        console.warn(`Cliente sin email para factura ${factura.id}`);
        return;
      }

      const pdfBuffer = await this.generarPDFBuffer(factura.id, agroservicioId);

      await this.mailService.sendInvoiceEmail(
        factura.cliente.email,
        factura.cliente.nombre || 'Cliente',
        factura.numero_factura,
        pdfBuffer,
      );
    } catch (error) {
      console.error(`Error enviando factura ${factura.id} por correo:`, error);
    }
  }

  async generarAgroFacturaPDF(
    id: string,
    @Res() res: Response,
    isPreview = false,
    propietarioId: string,
  ) {
    try {
      const factura = await this.facturaEncabezadoRepository.findOne({
        where: { id },
        relations: [
          'cliente',
          'detalles',
          'detalles.producto',
          'rango_factura',
        ],
      });

      if (!factura) {
        return res.status(404).json({ message: 'Factura no encontrada' });
      }

      const pdfBuffer = await this.generarPDFBuffer(id, propietarioId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `${isPreview ? 'inline' : 'attachment'}; filename=factura_${factura.numero_factura}.pdf`,
      );

      res.send(pdfBuffer);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al generar el PDF',
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }
  }
}
