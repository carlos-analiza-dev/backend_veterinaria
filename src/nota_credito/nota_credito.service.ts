import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotaCreditoDto } from './dto/create-nota_credito.dto';
import { UpdateNotaCreditoDto } from './dto/update-nota_credito.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotaCredito } from './entities/nota_credito.entity';
import { DetallesNotaCredito } from 'src/detalles_nota_credito/entities/detalles_nota_credito.entity';
import {
  EstadoFactura,
  FacturaEncabezado,
} from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import {
  MovimientosLote,
  TipoMovimiento,
} from 'src/movimientos_lotes/entities/movimientos_lote.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { DescuentosCliente } from 'src/descuentos_clientes/entities/descuentos_cliente.entity';
import { FacturaDetalle } from 'src/factura_detalle/entities/factura_detalle.entity';
import { User } from 'src/auth/entities/auth.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class NotaCreditoService {
  constructor(
    @InjectRepository(NotaCredito)
    private notaCreditoRepository: Repository<NotaCredito>,
    @InjectRepository(DetallesNotaCredito)
    private detalleNotaCreditoRepository: Repository<DetallesNotaCredito>,
    @InjectRepository(FacturaEncabezado)
    private facturaRepository: Repository<FacturaEncabezado>,
    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Lote)
    private loteRepository: Repository<Lote>,
    @InjectRepository(MovimientosLote)
    private movimientoLoteRepository: Repository<MovimientosLote>,
    @InjectRepository(SubServicio)
    private productoRepository: Repository<SubServicio>,
    private dataSource: DataSource,
  ) {}

  async create(user: User, createNotaCreditoDto: CreateNotaCreditoDto) {
    const usuarioId = user.id || '';
    const paisId = user.pais.id || '';
    const { factura_id, monto, motivo, detalles } = createNotaCreditoDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pais = await this.paisRepository.findOne({ where: { id: paisId } });
      if (!pais) {
        throw new NotFoundException('No se encontro el pais seleccionado');
      }

      const usuario = await this.usersRepository.findOne({
        where: { id: usuarioId },
      });
      if (!usuario) {
        throw new NotFoundException('No se encontro el usuario seleccionado');
      }

      const factura = await queryRunner.manager.findOne(FacturaEncabezado, {
        where: { id: factura_id },
        relations: [
          'sucursal',
          'detalles',
          'detalles.producto_servicio',
          'detalles.producto_servicio.tax',
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
        pais_id: paisId,
        usuario_id: usuarioId,
        monto,
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
        const producto = await queryRunner.manager.findOne(SubServicio, {
          where: { id: detalle.producto_id },
          relations: ['tax'],
        });

        if (!producto) {
          throw new NotFoundException(
            `El producto con ID ${detalle.producto_id} no existe.`,
          );
        }

        const detalleFactura = factura.detalles.find(
          (d) => d.id_producto_servicio === detalle.producto_id,
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

        const lote = await queryRunner.manager.findOne(Lote, {
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

  private async calcularMontosDetalleNota(
    detalleFactura: FacturaDetalle,
    cantidadDevolver: number,
    descuentoFactura: DescuentosCliente | null,
  ) {
    const precioUnitario = Number(detalleFactura.precio);
    const subTotal = precioUnitario * cantidadDevolver;
    const taxPorcentajeNum =
      Number(detalleFactura.producto_servicio?.tax?.porcentaje) || 0;

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
    detalleFactura: FacturaDetalle,
    cantidadDevolver: number,
    montosDetalle: any,
  ) {
    detalleFactura.cantidad = Math.max(
      0,
      detalleFactura.cantidad - cantidadDevolver,
    );

    if (detalleFactura.cantidad === 0) {
      await queryRunner.manager.remove(FacturaDetalle, detalleFactura);
    } else {
      const precioUnitario = Number(detalleFactura.precio);
      detalleFactura.total = detalleFactura.cantidad * precioUnitario;
      await queryRunner.manager.save(detalleFactura);
    }
  }

  private async actualizarFacturaDespuesNotaCredito(
    queryRunner: any,
    factura: FacturaEncabezado,
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

    factura.total_letras = await this.convertirNumeroALetras(factura.total);

    await queryRunner.manager.save(factura);
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

  async findAll(user: User, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const paisId = user.pais.id;

    try {
      const [notas, total] = await this.notaCreditoRepository
        .createQueryBuilder('nota')
        .leftJoinAndSelect('nota.usuario', 'usuario')
        .leftJoinAndSelect('nota.pais', 'pais')
        .leftJoinAndSelect('nota.factura', 'factura')
        .leftJoinAndSelect('nota.detalles', 'detalles')
        .where('nota.pais_id = :paisId', { paisId })
        .orderBy('nota.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      if (!notas || notas.length === 0) {
        throw new NotFoundException(
          'No se encontraron notas de crédito disponibles',
        );
      }

      const notas_plain = instanceToPlain(notas);

      return {
        total,
        notas: notas_plain,
      };
    } catch (error) {
      throw error;
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} notaCredito`;
  }

  update(id: string, updateNotaCreditoDto: UpdateNotaCreditoDto) {
    return `This action updates a #${id} notaCredito`;
  }

  remove(id: string) {
    return `This action removes a #${id} notaCredito`;
  }
}
