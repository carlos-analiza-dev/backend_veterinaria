import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { DatosEmpresa } from 'src/datos-empresa/entities/datos-empresa.entity';
import { User } from 'src/auth/entities/auth.entity';

const escpos = require('escpos');

@Injectable()
export class GenerateFacturaTermicaService {
  private readonly logger = new Logger(GenerateFacturaTermicaService.name);

  constructor(
    @InjectRepository(FacturaEncabezado)
    private readonly facturaEncabezadoRepository: Repository<FacturaEncabezado>,
    @InjectRepository(DatosEmpresa)
    private readonly datosEmpresaRepository: Repository<DatosEmpresa>,
  ) {}

  async generarFacturaTermica(id: string, res: Response, user: User) {
    try {
      const factura = await this.facturaEncabezadoRepository.findOne({
        where: { id },
        relations: [
          'cliente',
          'detalles',
          'detalles.producto_servicio',
          'rango_factura',
        ],
      });

      if (!factura) {
        return res.status(404).json({ message: 'Factura no encontrada' });
      }

      const datosEmpresa = await this.datosEmpresaRepository.findOne({
        where: {},
      });

      if (!datosEmpresa) {
        return res
          .status(404)
          .json({ message: 'Datos de la empresa no configurados' });
      }

      const contenidoFactura = this.generarContenidoFactura(
        factura,
        datosEmpresa,
        user,
      );

      res.setHeader('Content-Type', 'text/plain; charset=iso-8859-1');
      res.setHeader(
        'Content-Disposition',
        `inline; filename=factura_${factura.numero_factura}.txt`,
      );
      res.send(contenidoFactura);
    } catch (error) {
      this.logger.error(`Error al generar factura térmica: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al generar factura térmica',
          error: error.message,
        });
      }
    }
  }

  async imprimirDirecto(id: string, res: Response, user: User) {
    try {
      const factura = await this.facturaEncabezadoRepository.findOne({
        where: { id },
        relations: ['cliente', 'detalles', 'detalles.producto_servicio'],
      });

      if (!factura) {
        return res.status(404).json({ message: 'Factura no encontrada' });
      }

      const datosEmpresa = await this.datosEmpresaRepository.findOne({
        where: {},
      });

      const impresionExitosa = await this.imprimirEnImpresoraTermica(
        factura,
        datosEmpresa,
        user,
      );

      if (impresionExitosa) {
        res.json({
          message: 'Factura enviada a impresora térmica exitosamente',
          factura: factura.numero_factura,
        });
      } else {
        res.status(500).json({
          message: 'No se pudo imprimir en la impresora térmica',
        });
      }
    } catch (error) {
      this.logger.error(`Error en impresión directa: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al imprimir factura',
          error: error.message,
        });
      }
    }
  }

  private async imprimirEnImpresoraTermica(
    factura: FacturaEncabezado,
    datosEmpresa: DatosEmpresa,
    user: User,
  ): Promise<boolean> {
    const simbolo = user.pais.simbolo_moneda;
    return new Promise((resolve) => {
      try {
        const device = new escpos.USB();

        const printer = new escpos.Printer(device);

        device.open((error: any) => {
          if (error) {
            this.logger.warn(
              'No se pudo conectar a impresora USB, usando archivo de texto',
            );
            resolve(false);
            return;
          }

          try {
            printer
              .font('a')
              .align('ct')
              .style('b')
              .size(1, 1)
              .text(datosEmpresa.propietario)
              .text(datosEmpresa.direccion)
              .text(`RTN: ${datosEmpresa.rtn}`)
              .align('lt')
              .style('normal')
              .size(0, 0)
              .text('='.repeat(32))
              .feed(1);

            printer
              .text(`FACTURA: ${factura.numero_factura}`)
              .text(`FECHA: ${this.formatDate(factura.created_at)}`)
              .text(`CLIENTE: ${factura.cliente.nombre}`)
              .text(`RTN: ${(factura.cliente as any).rtn || 'N/A'}`)
              .text('-'.repeat(32));

            printer.text('CANT DESC          TOTAL');
            printer.text('-'.repeat(32));

            factura.detalles.forEach((detalle) => {
              const descripcion =
                detalle.producto_servicio?.nombre || 'Producto';
              const descTruncada =
                descripcion.length > 12
                  ? descripcion.substring(0, 12) + '...'
                  : descripcion.padEnd(15);

              const linea = `${detalle.cantidad
                .toString()
                .padEnd(4)} ${descTruncada} L.${this.formatNumber(
                Number(detalle.total),
              )}`;
              printer.text(linea);
            });

            printer.text('-'.repeat(32));

            printer
              .text(
                `SUBTOTAL:    ${simbolo} ${this.formatNumber(
                  Number(factura.sub_total),
                )}`,
              )
              .text(
                `ISV 15%:     ${simbolo} ${this.formatNumber(
                  Number(factura.isv_15),
                )}`,
              )
              .text(
                `ISV 18%:     ${simbolo} ${this.formatNumber(
                  Number(factura.isv_18),
                )}`,
              )
              .text('='.repeat(32))
              .style('b')
              .text(
                `TOTAL:       ${simbolo} ${this.formatNumber(
                  Number(factura.total),
                )}`,
              )
              .style('normal')
              .text('='.repeat(32))
              .feed(1)
              .text('GRACIAS POR SU COMPRA!')
              .feed(2)
              .cut()
              .close();

            resolve(true);
          } catch (printError) {
            this.logger.error(`Error al imprimir: ${printError}`);
            resolve(false);
          }
        });
      } catch (deviceError) {
        this.logger.warn('Error al inicializar dispositivo de impresión');
        resolve(false);
      }
    });
  }

  private generarContenidoFactura(
    factura: FacturaEncabezado,
    datosEmpresa: DatosEmpresa,
    user: User,
  ): string {
    const simbolo = user.pais.simbolo_moneda;
    const formatNumber = (num: number): string => {
      return new Intl.NumberFormat('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    let contenido = '';

    contenido +=
      this.centrarTexto(datosEmpresa.nombre_empresa.toUpperCase(), 32) + '\n';
    contenido += this.centrarTexto(datosEmpresa.propietario, 32) + '\n';
    contenido += this.centrarTexto(datosEmpresa.direccion, 32) + '\n';
    contenido += this.centrarTexto(datosEmpresa.rtn, 32) + '\n';
    contenido += this.centrarTexto(datosEmpresa.correo, 32) + '\n';
    contenido += this.centrarTexto(datosEmpresa.telefono, 32) + '\n';
    contenido += '='.repeat(32) + '\n\n';

    contenido += `FACTURA: ${factura.numero_factura}\n`;
    contenido += `FECHA: ${this.formatDate(factura.created_at)}\n`;
    contenido += `PAGO: ${factura.forma_pago.toUpperCase()}\n`;
    contenido += '-'.repeat(32) + '\n';

    contenido += 'CLIENTE:\n';
    contenido += `${factura.cliente.nombre || 'Cliente'}\n`;
    contenido += '-'.repeat(32) + '\n';

    contenido += 'CANT DESCRIPCION       TOTAL\n';
    contenido += '-'.repeat(32) + '\n';

    factura.detalles.forEach((detalle, index) => {
      const descripcion = detalle.producto_servicio?.nombre || 'Producto';
      const cantidad = detalle.cantidad.toString().padStart(3);
      const precioUnitario = `${simbolo} ${formatNumber(
        Number(detalle.precio),
      )}`;
      const total = `${simbolo} ${formatNumber(Number(detalle.total))}`;

      const descTruncada =
        descripcion.length > 12
          ? descripcion.substring(0, 12) + '...'
          : descripcion.padEnd(15);

      contenido += `${cantidad} x ${descTruncada}\n`;
      contenido += `     ${precioUnitario.padStart(10)} = ${total.padStart(
        12,
      )}\n`;

      if ((index + 1) % 3 === 0 && index !== factura.detalles.length - 1) {
        contenido += '-'.repeat(32) + '\n';
      }
    });

    contenido += '='.repeat(32) + '\n';

    const resumenFinanciero = [
      { label: 'SUB-TOTAL:', value: factura.sub_total },
      { label: 'DESCUENTOS/REBAJAS:', value: factura.descuentos_rebajas },
      { label: 'IMPORTE EXENTO:', value: factura.importe_exento },
      { label: 'IMPORTE EXONERADO:', value: factura.importe_exonerado },
      { label: 'BASE 15%:', value: factura.importe_gravado_15 },
      { label: 'ISV 15%:', value: factura.isv_15 },
      { label: 'BASE 18%:', value: factura.importe_gravado_18 },
      { label: 'ISV 18%:', value: factura.isv_18 },
    ];

    const totalImpuestos = Number(factura.isv_15) + Number(factura.isv_18);

    resumenFinanciero.forEach((item) => {
      const valor = Number(item.value);

      const label = item.label.padEnd(22);
      const valorFormateado = `${simbolo} ${formatNumber(valor)}`.padStart(10);
      contenido += `${label}${valorFormateado}\n`;
    });

    if (totalImpuestos > 0) {
      contenido += '-'.repeat(32) + '\n';
      contenido += `TOTAL IMPUESTOS:`.padEnd(22);
      contenido +=
        `${simbolo} ${formatNumber(totalImpuestos)}`.padStart(10) + '\n';
    }

    contenido += '='.repeat(32) + '\n';
    contenido += 'TOTAL A PAGAR:'.padEnd(22);
    contenido +=
      `${simbolo} ${formatNumber(Number(factura.total))}`.padStart(10) + '\n';
    contenido += '='.repeat(32) + '\n\n';

    contenido += 'TOTAL EN LETRAS:\n';
    contenido += '-'.repeat(32) + '\n';
    const totalEnLetras =
      factura.total_letras || this.numeroALetras(factura.total);

    const palabras = totalEnLetras.split(' ');
    let lineaActual = '';
    const lineasLetras = [];

    palabras.forEach((palabra) => {
      if ((lineaActual + palabra).length <= 32) {
        lineaActual += (lineaActual ? ' ' : '') + palabra;
      } else {
        lineasLetras.push(lineaActual);
        lineaActual = palabra;
      }
    });
    if (lineaActual) {
      lineasLetras.push(lineaActual);
    }

    lineasLetras.forEach((linea) => {
      contenido += linea + '\n';
    });
    contenido += '\n';

    contenido += 'INFORMACIÓN ADICIONAL:\n';
    contenido += '-'.repeat(32) + '\n';
    contenido += `C.A.I: ${factura.rango_factura?.cai || 'N/A'}\n`;
    contenido += `Rango: ${factura.rango_factura?.rango_inicial || ''}-${
      factura.rango_factura?.rango_final || ''
    }\n`;
    contenido += `Vence: ${this.formatDate(
      factura.rango_factura?.fecha_limite_emision || '',
    )}\n`;
    contenido += '\n';

    contenido += `FORMA DE PAGO: ${factura.forma_pago.toUpperCase()}\n`;
    contenido += '\n';

    contenido += this.centrarTexto('_________________________', 32) + '\n';
    contenido += this.centrarTexto('FIRMA AUTORIZADA', 32) + '\n';
    contenido += '\n';

    contenido += this.centrarTexto('*** GRACIAS POR SU COMPRA ***', 32) + '\n';
    contenido += this.centrarTexto('VUELVA PRONTO', 32) + '\n';
    contenido += '\n';
    contenido +=
      this.centrarTexto(
        `©${new Date().getFullYear()} ${datosEmpresa.propietario}`,
        32,
      ) + '\n';

    return contenido;
  }

  private formatDate(date: any): string {
    if (!date) return 'N/A';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('es-ES');
    } catch {
      return 'N/A';
    }
  }

  private formatNumber(num: number): string {
    return new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  private centrarTexto(texto: string, ancho: number): string {
    if (texto.length >= ancho) return texto;
    const espacios = Math.floor((ancho - texto.length) / 2);
    return ' '.repeat(espacios) + texto;
  }

  private numeroALetras(numero: number): string {
    const unidades = [
      '',
      'UNO',
      'DOS',
      'TRES',
      'CUATRO',
      'CINCO',
      'SEIS',
      'SIETE',
      'OCHO',
      'NUEVE',
    ];
    const decenas = [
      '',
      'DIEZ',
      'VEINTE',
      'TREINTA',
      'CUARENTA',
      'CINCUENTA',
      'SESENTA',
      'SETENTA',
      'OCHENTA',
      'NOVENTA',
    ];

    if (numero === 0) return 'CERO';
    if (numero < 10) return unidades[numero];
    if (numero < 100) {
      const decena = Math.floor(numero / 10);
      const unidad = numero % 10;
      return decenas[decena] + (unidad > 0 ? ' Y ' + unidades[unidad] : '');
    }

    return `(${this.formatNumber(numero)})`;
  }
}
