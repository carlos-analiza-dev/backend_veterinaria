import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoteAgroProducto } from 'src/agro-compras-productos/entities/lote-agro-compra.entity';
import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';
import { AgroFacturacion } from 'src/agro_facturacion/entities/agro_facturacion.entity';
import { TipoMovimiento } from 'src/movimientos_lotes/entities/movimientos_lote.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateNotaCreditoDto } from './dto/create-nota_credito.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AgroNotaCredito } from './entities/nota_agro_credito.entity';
import { DetallesAgroNotaCredito } from 'src/detalles_nota_credito/entities/detalles_agro_nota_credito.entity';
import { AgroMovimientosLote } from 'src/movimientos_lotes/entities/agro_movimientos_lotes.entity';
import { AgroFacturaDetalle } from 'src/agro_facturacion/entities/agro_factura_detalle.entity';
import { DescuentosAgroCliente } from 'src/descuentos_clientes/entities/descuentos_clientes_agro.entity';
import { EstadoFactura } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { convertirNumeroALetras } from 'src/helpers/convertir_numeros_letras';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { instanceToPlain } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  AccionEmpleado,
  AuditoriaEmpleados,
} from 'src/empleados-agro/entities/auditoria_empleados.entity';

@Injectable()
export class NotaCreditoAgroService {
  constructor(
    @InjectRepository(AgroNotaCredito)
    private notaCreditoRepository: Repository<AgroNotaCredito>,
    @InjectRepository(DetallesAgroNotaCredito)
    private detalleNotaCreditoRepository: Repository<DetallesAgroNotaCredito>,
    @InjectRepository(AgroMovimientosLote)
    private movimientoLoteRepository: Repository<AgroMovimientosLote>,
    private readonly validationAgro: AgroservicioValidationService,
    @InjectRepository(AuditoriaEmpleados)
    private readonly auditoriaEmpleadosRepo: Repository<AuditoriaEmpleados>,
    private dataSource: DataSource,
  ) {}

  async create(cliente: Cliente, createNotaCreditoDto: CreateNotaCreditoDto) {
    const propietarioId = cliente.id ?? '';
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const { factura_id, monto, motivo, detalles } = createNotaCreditoDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const factura = await queryRunner.manager.findOne(AgroFacturacion, {
        where: { id: factura_id },
        relations: [
          'sucursal',
          'detalles',
          'detalles.producto',
          'detalles.producto.tax',
          'descuento',
        ],
      });

      if (!factura) {
        throw new NotFoundException('No se encontro la factura seleccionada');
      }

      if (factura.estado === 'Cancelada') {
        throw new BadRequestException(
          'No se puede crear nota de crédito para una factura cancelada',
        );
      }

      const nota = this.notaCreditoRepository.create({
        factura_id: factura_id,
        monto,
        agroservicio,
        motivo,
      });

      const notaGuardada = await queryRunner.manager.save(nota);

      let totalDescuentoNota = 0;
      let importeExentoNota = 0;
      let importeExoneradoNota = 0;
      let importeGravado15Nota = 0;
      let importeGravado18Nota = 0;
      let isv15Nota = 0;
      let isv18Nota = 0;
      let subTotalNota = 0;
      let totalNota = 0;

      for (const detalle of detalles) {
        const producto = await queryRunner.manager.findOne(AgroProducto, {
          where: { id: detalle.producto_id },
          relations: ['tax'],
        });

        if (!producto) {
          throw new NotFoundException(
            `El producto con ID ${detalle.producto_id} no existe.`,
          );
        }

        const detalleFactura = factura.detalles.find(
          (d) => d.id_producto === detalle.producto_id,
        );

        if (!detalleFactura) {
          throw new NotFoundException(
            `No se puede agregar el producto ${producto.nombre}, ya que no fue facturado en la factura ${factura.numero_factura}.`,
          );
        }

        if (detalle.cantidad > detalleFactura.cantidad) {
          throw new BadRequestException(
            `La cantidad a devolver (${detalle.cantidad}) del producto ${producto.nombre} excede la cantidad facturada (${detalleFactura.cantidad})`,
          );
        }

        const lote = await queryRunner.manager.findOne(LoteAgroProducto, {
          where: {
            id_producto: producto.id,
            id_sucursal: factura.sucursal_id,
          },
        });

        if (!lote) {
          throw new NotFoundException(
            `No se encontró lote para el producto ${producto.nombre} en la sucursal.`,
          );
        }

        if (detalle.cantidad <= 0) {
          throw new BadRequestException(
            `La cantidad del producto ${producto.nombre} debe ser mayor que 0.`,
          );
        }

        const montosDetalle = await this.calcularMontosDetalleNota(
          detalleFactura,
          detalle.cantidad,
          factura.descuento,
        );

        subTotalNota += montosDetalle.subTotal;
        importeExentoNota += montosDetalle.importeExento;
        importeExoneradoNota += montosDetalle.importeExonerado;
        importeGravado15Nota += montosDetalle.importeGravado15;
        importeGravado18Nota += montosDetalle.importeGravado18;
        isv15Nota += montosDetalle.isv15;
        isv18Nota += montosDetalle.isv18;
        totalDescuentoNota += montosDetalle.descuento;
        totalNota += montosDetalle.total;

        await this.actualizarDetalleFactura(
          queryRunner,
          detalleFactura,
          detalle.cantidad,
          montosDetalle,
        );

        const cantidadAnterior = Number(lote.cantidad);
        lote.cantidad = cantidadAnterior + Number(detalle.cantidad);
        await queryRunner.manager.save(lote);

        const nuevoDetalle = this.detalleNotaCreditoRepository.create({
          nota_id: notaGuardada.id,
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad,
          montoDevuelto: montosDetalle.total,
        });
        await queryRunner.manager.save(nuevoDetalle);

        const movimiento = this.movimientoLoteRepository.create({
          lote_id: lote.id,
          producto_id: producto.id,
          factura_id: factura.id,
          cantidad: detalle.cantidad,
          tipo: TipoMovimiento.DEVOLUCION,
          descripcion: `Devolución por nota de crédito #${notaGuardada.id}`,
          cantidad_anterior: cantidadAnterior,
          cantidad_nueva: Number(lote.cantidad),
        });

        await queryRunner.manager.save(movimiento);
      }

      await this.actualizarFacturaDespuesNotaCredito(queryRunner, factura, {
        subTotal: subTotalNota,
        descuento: totalDescuentoNota,
        importeExento: importeExentoNota,
        importeExonerado: importeExoneradoNota,
        importeGravado15: importeGravado15Nota,
        importeGravado18: importeGravado18Nota,
        isv15: isv15Nota,
        isv18: isv18Nota,
        total: totalNota,
      });

      await queryRunner.commitTransaction();

      return await this.notaCreditoRepository.findOne({
        where: { id: notaGuardada.id },
        relations: ['factura', 'detalles', 'factura.detalles'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createEmpleado(
    empleado: EmpleadosAgro,
    createNotaCreditoDto: CreateNotaCreditoDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const { factura_id, monto, motivo, detalles } = createNotaCreditoDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const factura = await queryRunner.manager.findOne(AgroFacturacion, {
        where: { id: factura_id },
        relations: [
          'sucursal',
          'detalles',
          'detalles.producto',
          'detalles.producto.tax',
          'descuento',
        ],
      });

      if (!factura) {
        throw new NotFoundException('No se encontro la factura seleccionada');
      }

      if (factura.estado === 'Cancelada') {
        throw new BadRequestException(
          'No se puede crear nota de crédito para una factura cancelada',
        );
      }

      const nota = this.notaCreditoRepository.create({
        factura_id: factura_id,
        monto,
        agroservicio,
        motivo,
      });

      const notaGuardada = await queryRunner.manager.save(nota);

      let totalDescuentoNota = 0;
      let importeExentoNota = 0;
      let importeExoneradoNota = 0;
      let importeGravado15Nota = 0;
      let importeGravado18Nota = 0;
      let isv15Nota = 0;
      let isv18Nota = 0;
      let subTotalNota = 0;
      let totalNota = 0;

      for (const detalle of detalles) {
        const producto = await queryRunner.manager.findOne(AgroProducto, {
          where: { id: detalle.producto_id },
          relations: ['tax'],
        });

        if (!producto) {
          throw new NotFoundException(
            `El producto con ID ${detalle.producto_id} no existe.`,
          );
        }

        const detalleFactura = factura.detalles.find(
          (d) => d.id_producto === detalle.producto_id,
        );

        if (!detalleFactura) {
          throw new NotFoundException(
            `No se puede agregar el producto ${producto.nombre}, ya que no fue facturado en la factura ${factura.numero_factura}.`,
          );
        }

        if (detalle.cantidad > detalleFactura.cantidad) {
          throw new BadRequestException(
            `La cantidad a devolver (${detalle.cantidad}) del producto ${producto.nombre} excede la cantidad facturada (${detalleFactura.cantidad})`,
          );
        }

        const lote = await queryRunner.manager.findOne(LoteAgroProducto, {
          where: {
            id_producto: producto.id,
            id_sucursal: factura.sucursal_id,
          },
        });

        if (!lote) {
          throw new NotFoundException(
            `No se encontró lote para el producto ${producto.nombre} en la sucursal.`,
          );
        }

        if (detalle.cantidad <= 0) {
          throw new BadRequestException(
            `La cantidad del producto ${producto.nombre} debe ser mayor que 0.`,
          );
        }

        const montosDetalle = await this.calcularMontosDetalleNota(
          detalleFactura,
          detalle.cantidad,
          factura.descuento,
        );

        subTotalNota += montosDetalle.subTotal;
        importeExentoNota += montosDetalle.importeExento;
        importeExoneradoNota += montosDetalle.importeExonerado;
        importeGravado15Nota += montosDetalle.importeGravado15;
        importeGravado18Nota += montosDetalle.importeGravado18;
        isv15Nota += montosDetalle.isv15;
        isv18Nota += montosDetalle.isv18;
        totalDescuentoNota += montosDetalle.descuento;
        totalNota += montosDetalle.total;

        await this.actualizarDetalleFactura(
          queryRunner,
          detalleFactura,
          detalle.cantidad,
          montosDetalle,
        );

        const cantidadAnterior = Number(lote.cantidad);
        lote.cantidad = cantidadAnterior + Number(detalle.cantidad);
        await queryRunner.manager.save(lote);

        const nuevoDetalle = this.detalleNotaCreditoRepository.create({
          nota_id: notaGuardada.id,
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad,
          montoDevuelto: montosDetalle.total,
        });
        await queryRunner.manager.save(nuevoDetalle);

        const movimiento = this.movimientoLoteRepository.create({
          lote_id: lote.id,
          producto_id: producto.id,
          factura_id: factura.id,
          cantidad: detalle.cantidad,
          tipo: TipoMovimiento.DEVOLUCION,
          descripcion: `Devolución por nota de crédito #${notaGuardada.id}`,
          cantidad_anterior: cantidadAnterior,
          cantidad_nueva: Number(lote.cantidad),
        });

        await queryRunner.manager.save(movimiento);
      }

      await this.actualizarFacturaDespuesNotaCredito(queryRunner, factura, {
        subTotal: subTotalNota,
        descuento: totalDescuentoNota,
        importeExento: importeExentoNota,
        importeExonerado: importeExoneradoNota,
        importeGravado15: importeGravado15Nota,
        importeGravado18: importeGravado18Nota,
        isv15: isv15Nota,
        isv18: isv18Nota,
        total: totalNota,
      });

      await queryRunner.commitTransaction();

      const auditoria = queryRunner.manager.create(AuditoriaEmpleados, {
        empleadoId: empleado.id,
        accion: AccionEmpleado.CREAR_NOTA_CREDITO,
        descripcion: `El empleado creó la nota de crédito ${notaGuardada.id} para la factura ${factura.numero_factura}. Motivo: ${motivo}. Monto: ${totalNota.toFixed(2)}`,
      });

      await queryRunner.manager.save(auditoria);

      return await this.notaCreditoRepository.findOne({
        where: { id: notaGuardada.id },
        relations: ['factura', 'detalles', 'factura.detalles'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async calcularMontosDetalleNota(
    detalleFactura: AgroFacturaDetalle,
    cantidadDevolver: number,
    descuentoFactura: DescuentosAgroCliente | null,
  ) {
    const precioUnitario = Number(detalleFactura.precio);
    const subTotal = precioUnitario * cantidadDevolver;
    const taxPorcentajeNum =
      Number(detalleFactura.producto?.tax?.porcentaje) || 0;

    let importeExento = 0;
    let importeExonerado = 0;
    let importeGravado15 = 0;
    let importeGravado18 = 0;
    let isv15 = 0;
    let isv18 = 0;
    let descuento = 0;

    const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

    if (Math.abs(taxPorcentajeNum - 0) < 0.001) {
      importeExento = subTotal;
    } else if (Math.abs(taxPorcentajeNum - 15) < 0.001) {
      importeGravado15 = subTotal;
      isv15 = subTotal * 0.15;
    } else if (Math.abs(taxPorcentajeNum - 18) < 0.001) {
      importeGravado18 = subTotal;
      isv18 = subTotal * 0.18;
    }

    if (descuentoFactura) {
      const porcentajeDescuento = Number(descuentoFactura.porcentaje) / 100;
      const baseParaDescuento = subTotal + isv15 + isv18;
      descuento = baseParaDescuento * porcentajeDescuento;
    }

    const total = round(subTotal + isv15 + isv18 - descuento);

    return {
      subTotal: round(subTotal),
      descuento: round(descuento),
      importeExento: round(importeExento),
      importeExonerado: round(importeExonerado),
      importeGravado15: round(importeGravado15),
      importeGravado18: round(importeGravado18),
      isv15: round(isv15),
      isv18: round(isv18),
      total,
    };
  }

  private async actualizarDetalleFactura(
    queryRunner: any,
    detalleFactura: AgroFacturaDetalle,
    cantidadDevolver: number,
    montosDetalle: any,
  ) {
    detalleFactura.cantidad = Math.max(
      0,
      detalleFactura.cantidad - cantidadDevolver,
    );

    if (detalleFactura.cantidad === 0) {
      await queryRunner.manager.remove(AgroFacturaDetalle, detalleFactura);
    } else {
      const precioUnitario = Number(detalleFactura.precio);
      detalleFactura.total = detalleFactura.cantidad * precioUnitario;
      await queryRunner.manager.save(detalleFactura);
    }
  }

  private async actualizarFacturaDespuesNotaCredito(
    queryRunner: any,
    factura: AgroFacturacion,
    montosNota: {
      subTotal: number;
      descuento: number;
      importeExento: number;
      importeExonerado: number;
      importeGravado15: number;
      importeGravado18: number;
      isv15: number;
      isv18: number;
      total: number;
    },
  ) {
    factura.sub_total = Math.max(
      0,
      Number(factura.sub_total) - montosNota.subTotal,
    );
    factura.descuentos_rebajas = Math.max(
      0,
      Number(factura.descuentos_rebajas) - montosNota.descuento,
    );
    factura.importe_exento = Math.max(
      0,
      Number(factura.importe_exento) - montosNota.importeExento,
    );
    factura.importe_exonerado = Math.max(
      0,
      Number(factura.importe_exonerado) - montosNota.importeExonerado,
    );
    factura.importe_gravado_15 = Math.max(
      0,
      Number(factura.importe_gravado_15) - montosNota.importeGravado15,
    );
    factura.importe_gravado_18 = Math.max(
      0,
      Number(factura.importe_gravado_18) - montosNota.importeGravado18,
    );

    factura.isv_15 = Math.max(0, Number(factura.isv_15) - montosNota.isv15);
    factura.isv_18 = Math.max(0, Number(factura.isv_18) - montosNota.isv18);
    factura.total = Math.max(0, Number(factura.total) - montosNota.total);

    if (factura.total === 0) {
      factura.estado = EstadoFactura.CANCELADA;
    }

    factura.total_letras = convertirNumeroALetras(factura.total);

    await queryRunner.manager.save(factura);
  }

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      sucursal,
      fechaInicio,
      fechaFin,
    } = paginationDto;

    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);

    const agroservicioId = agroservicio.id;

    try {
      const queryBuilder = this.notaCreditoRepository
        .createQueryBuilder('nota')
        .leftJoinAndSelect('nota.agroservicio', 'agroservicio')
        .leftJoinAndSelect('nota.factura', 'factura')
        .leftJoinAndSelect('nota.detalles', 'detalles')
        .where('nota.agroservicioId = :agroservicioId', {
          agroservicioId,
        });

      if (sucursal) {
        queryBuilder.andWhere('factura.sucursal_id = :sucursal', {
          sucursal,
        });
      }

      if (
        fechaInicio &&
        fechaFin &&
        fechaInicio.trim() !== '' &&
        fechaFin.trim() !== ''
      ) {
        queryBuilder.andWhere(
          'DATE(nota.createdAt) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)',
          {
            fechaInicio,
            fechaFin,
          },
        );
      } else if (fechaInicio && fechaInicio.trim() !== '') {
        queryBuilder.andWhere('DATE(nota.createdAt) >= DATE(:fechaInicio)', {
          fechaInicio,
        });
      } else if (fechaFin && fechaFin.trim() !== '') {
        queryBuilder.andWhere('DATE(nota.createdAt) <= DATE(:fechaFin)', {
          fechaFin,
        });
      }

      queryBuilder.orderBy('nota.createdAt', 'DESC').skip(offset).take(limit);

      const [notas, total] = await queryBuilder.getManyAndCount();

      if (!notas || notas.length === 0) {
        throw new NotFoundException(
          'No se encontraron notas de crédito disponibles',
        );
      }

      return {
        total,
        notas: instanceToPlain(notas),
      };
    } catch (error) {
      throw error;
    }
  }
}
