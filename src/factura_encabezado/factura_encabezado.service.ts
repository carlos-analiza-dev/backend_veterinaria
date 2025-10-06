import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacturaEncabezadoDto } from './dto/create-factura_encabezado.dto';
import { UpdateFacturaEncabezadoDto } from './dto/update-factura_encabezado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RangoFactura } from 'src/rangos-factura/entities/rango-factura.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FacturaEncabezado } from './entities/factura_encabezado.entity';
import { FacturaDetalle } from 'src/factura_detalle/entities/factura_detalle.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { CreateFacturaDetalleDto } from 'src/factura_detalle/dto/create-factura_detalle.dto';

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
    private dataSource: DataSource,
  ) {}
  async create(createFacturaEncabezadoDto: CreateFacturaEncabezadoDto) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const cliente = await transactionalEntityManager.findOne(Cliente, {
          where: { id: createFacturaEncabezadoDto.id_cliente },
        });

        if (!cliente) {
          throw new NotFoundException('Cliente no encontrado');
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

        const total = totales.subTotal + totales.isv15 + totales.isv18;

        const factura = transactionalEntityManager.create(FacturaEncabezado, {
          ...createFacturaEncabezadoDto,
          cliente,
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
          total: total,
          total_letras: this.convertirNumeroALetras(total),
        });

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
          relations: ['detalles', 'detalles.producto_servicio', 'cliente'],
        });
      },
    );
  }
  findAll() {
    return `This action returns all facturaEncabezado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facturaEncabezado`;
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
      const productoServicio = await transactionalEntityManager.findOne(
        SubServicio,
        {
          where: { id: detalleDto.id_producto_servicio },
        },
      );

      if (!productoServicio) {
        throw new NotFoundException(
          `Producto/Servicio con ID ${detalleDto.id_producto_servicio} no encontrado`,
        );
      }

      const totalDetalle = detalleDto.cantidad * detalleDto.precio;

      const tasaImpuesto = productoServicio.tasa_impuesto || 0.15;
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
        return `veinti${unidades[unidad]}`;
      }

      return `${decenas[decena]} y ${unidades[unidad]}`;
    }

    if (numero < 1000) {
      const centena = Math.floor(numero / 100);
      const resto = numero % 100;

      if (numero === 100) return 'cien';

      if (resto === 0) {
        return centenas[centena];
      }

      return `${centenas[centena]} ${this.convertirEnterosALetras(resto)}`;
    }

    if (numero < 1000000) {
      const miles = Math.floor(numero / 1000);
      const resto = numero % 1000;

      let milesTexto;
      if (miles === 1) {
        milesTexto = 'mil';
      } else {
        milesTexto = `${this.convertirEnterosALetras(miles)} mil`;
      }

      if (resto === 0) {
        return milesTexto;
      }

      return `${milesTexto} ${this.convertirEnterosALetras(resto)}`;
    }

    if (numero < 1000000000) {
      const millones = Math.floor(numero / 1000000);
      const resto = numero % 1000000;

      let millonesTexto;
      if (millones === 1) {
        millonesTexto = 'un millón';
      } else {
        millonesTexto = `${this.convertirEnterosALetras(millones)} millones`;
      }

      if (resto === 0) {
        return millonesTexto;
      }

      return `${millonesTexto} ${this.convertirEnterosALetras(resto)}`;
    }

    return 'Número demasiado grande';
  }

  update(id: number, updateFacturaEncabezadoDto: UpdateFacturaEncabezadoDto) {
    return `This action updates a #${id} facturaEncabezado`;
  }

  remove(id: number) {
    return `This action removes a #${id} facturaEncabezado`;
  }
}
