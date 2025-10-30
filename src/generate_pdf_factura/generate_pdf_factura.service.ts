import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Res } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

import * as path from 'path';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { DatosEmpresa } from 'src/datos-empresa/entities/datos-empresa.entity';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class FacturaPdfService {
  constructor(
    @InjectRepository(FacturaEncabezado)
    private readonly facturaEncabezadoRepository: Repository<FacturaEncabezado>,
    @InjectRepository(DatosEmpresa)
    private readonly datosEmpresaRepository: Repository<DatosEmpresa>,
  ) {}

  async generarFacturaPDF(
    id: string,
    @Res() res: Response,
    isPreview = false,
    user: User,
  ) {
    const simbolo = user.pais.simbolo_moneda;
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

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `${isPreview ? 'inline' : 'attachment'}; filename=factura_${
          factura.numero_factura
        }.pdf`,
      );

      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('error', (err) => {
        console.error('Error al generar PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error al generar el PDF' });
        }
      });

      doc.pipe(res);

      const logoPath = path.join(process.cwd(), 'src', 'images', 'logo.png');

      try {
        doc.image(logoPath, 400, 0, { width: 120 });
      } catch (error) {
        throw error;
      }

      const formatDate = (date: any): string => {
        if (!date) return 'N/A';

        if (date instanceof Date) {
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          };
          return date.toLocaleDateString('es-ES', options);
        }

        if (typeof date === 'string') {
          try {
            const dateObj = new Date(date);
            const options: Intl.DateTimeFormatOptions = {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            };
            return dateObj.toLocaleDateString('es-ES', options);
          } catch {
            return date;
          }
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

        if (bold) {
          doc.font('Helvetica-Bold');
        } else {
          doc.font('Helvetica');
        }

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

        if (bold) {
          doc.font('Helvetica-Bold');
        } else {
          doc.font('Helvetica');
        }

        doc
          .fontSize(fontSize)
          .fillColor(textColor)
          .text(text, x, y + (height - fontSize) / 2, {
            width: width - 10,
            align: 'right',
          });
      };

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Factura', 50, 60, { align: 'left' });

      doc.fontSize(10).font('Helvetica');
      doc.text(`No. de Factura ${factura.numero_factura}`, 50, 80, {
        align: 'left',
      });
      doc.text(`Fecha de Factura: ${formatDate(factura.created_at)}`, 50, 92, {
        align: 'left',
      });
      doc.text(
        `Fecha Limite de Emisión: ${formatDate(factura.fecha_limite_emision)}`,
        50,
        104,
        { align: 'left' },
      );
      doc.text(
        `Fecha de Recepción: ${formatDate(factura.fecha_recepcion)}`,
        50,
        116,
        {
          align: 'left',
        },
      );

      doc.text(
        `Rango Autorizado: ${factura.rango_factura.prefijo}-${factura.rango_factura.rango_inicial} hasta ${factura.rango_factura.prefijo}-${factura.rango_factura.rango_final}`,
        50,
        128,
        { align: 'left' },
      );

      const infoEmpresaY = 160;
      doc.fontSize(10);
      doc
        .font('Helvetica-Bold')
        .text(`Propietaria: ${datosEmpresa.propietario}`, 50, infoEmpresaY);
      doc.font('Helvetica').text(datosEmpresa.direccion, 50, infoEmpresaY + 12);
      doc.text(`${datosEmpresa.correo}`, 50, infoEmpresaY + 24);
      doc.text(`RTN: ${datosEmpresa.rtn}`, 50, infoEmpresaY + 36);
      doc
        .font('Helvetica-Bold')
        .text(
          `Forma de Pago: ${
            factura.forma_pago === 'Credito' ? 'Crédito' : 'Contado'
          }`,
          50,
          infoEmpresaY + 48,
        );

      const tableTop = 220;
      const cellHeight = 20;

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

      const clienteNombre = factura.cliente.nombre || 'Cliente';
      const clienteRtn = (factura.cliente as any).rtn || 'N/A';
      const clienteDireccion = (factura.cliente as any).direccion || 'N/A';
      const clienteCiudad = (factura.cliente as any).ciudad || 'N/A';

      drawCell(
        50,
        tableTop + cellHeight,
        250,
        cellHeight,
        `Nombre: ${clienteNombre}`,
        '#F8F9FA',
      );
      drawCell(
        300,
        tableTop + cellHeight,
        250,
        cellHeight,
        `RTN: ${clienteRtn}`,
        '#F8F9FA',
      );

      drawCell(
        50,
        tableTop + cellHeight * 2,
        500,
        cellHeight,
        `Dirección: ${clienteDireccion}`,
        '#FFFFFF',
      );
      drawCell(
        50,
        tableTop + cellHeight * 3,
        500,
        cellHeight,
        `Ciudad: ${clienteCiudad}`,
        '#F8F9FA',
      );

      const detallesTop = tableTop + cellHeight * 4 + 20;

      const colWidths = [80, 220, 100, 100];
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

      let currentY = detallesTop + cellHeight;

      factura.detalles.forEach((detalle, index) => {
        if (currentY > 650) {
          doc.addPage();
          currentY = 50;

          drawCell(
            50,
            currentY,
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
            currentY,
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
            currentY,
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
            currentY,
            colWidths[3],
            cellHeight,
            'TOTAL',
            '#2E86AB',
            '#FFFFFF',
            9,
            true,
          );
          currentY += cellHeight;
        }

        const backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
        const descripcion =
          detalle.producto_servicio?.nombre || 'Producto/Servicio';

        drawCell(
          50,
          currentY,
          colWidths[0],
          cellHeight,
          detalle.cantidad.toString(),
          backgroundColor,
          '#000000',
          8,
        );
        drawCell(
          130,
          currentY,
          colWidths[1],
          cellHeight,
          descripcion,
          backgroundColor,
          '#000000',
          8,
        );
        drawCellRight(
          350,
          currentY,
          colWidths[2],
          cellHeight,
          `${simbolo} ${formatNumber(Number(detalle.precio))}`,
          backgroundColor,
          '#000000',
          8,
        );
        drawCellRight(
          450,
          currentY,
          colWidths[3],
          cellHeight,
          `${simbolo} ${formatNumber(Number(detalle.total))}`,
          backgroundColor,
          '#000000',
          8,
        );

        currentY += cellHeight;
      });

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
        `(${factura.total_letras})` || '(CANTIDAD EN LETRAS)',
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
        { label: 'Subtotal', value: factura.sub_total, color: '#FFFFFF' },
        {
          label: 'Descuentos y Rebajas',
          value: factura.descuentos_rebajas,
          color: '#F8F9FA',
        },
        {
          label: 'Importe Exento',
          value: factura.importe_exento,
          color: '#FFFFFF',
        },
        {
          label: 'Importe Exonerado',
          value: factura.importe_exonerado,
          color: '#F8F9FA',
        },
        {
          label: 'Importe Gravado al 15%',
          value: factura.importe_gravado_15,
          color: '#FFFFFF',
        },
        {
          label: 'Importe Gravado al 18%',
          value: factura.importe_gravado_18,
          color: '#F8F9FA',
        },
        { label: 'ISV 15%', value: factura.isv_15, color: '#FFFFFF' },
        { label: 'ISV 18%', value: factura.isv_18, color: '#F8F9FA' },
      ];

      totales.forEach((item, index) => {
        const yPos = resumenTop + index * resumenCellHeight;
        drawCell(
          resumenLeft,
          yPos,
          80,
          resumenCellHeight,
          item.label,
          item.color,
          '#000000',
          6,
        );
        drawCellRight(
          430,
          yPos,
          120,
          resumenCellHeight,
          `${simbolo} ${formatNumber(Number(item.value))}`,
          item.color,
          '#000000',
          8,
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
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al generar la factura PDF',
          error: error.message,
        });
      }
    }
  }

  async generarFacturaPreview(id: string, @Res() res: Response, user: User) {
    try {
      return this.generarFacturaPDF(id, res, true, user);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al generar la previsualización',
          error: error.message,
        });
      }
    }
  }
}
