import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as path from 'path';
import { DatosEmpresa } from 'src/datos-empresa/entities/datos-empresa.entity';
import { NotaCredito } from 'src/nota_credito/entities/nota_credito.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/auth.entity';
import * as fs from 'fs';

@Injectable()
export class NotaCreditoPdfService {
  constructor(
    @InjectRepository(NotaCredito)
    private readonly notaCreditoRepository: Repository<NotaCredito>,
    @InjectRepository(DatosEmpresa)
    private readonly datosEmpresaRepository: Repository<DatosEmpresa>,
  ) {}

  async generarNotaCreditoPDF(
    id: string,
    @Res() res: Response,
    isPreview = false,
    user: User,
  ) {
    const simbolo = user.pais.simbolo_moneda;

    let notaCredito: NotaCredito;
    let datosEmpresa: DatosEmpresa;

    try {
      notaCredito = await this.notaCreditoRepository.findOne({
        where: { id },
        relations: [
          'factura',
          'factura.cliente',
          'factura.rango_factura',
          'factura.descuento',
          'detalles',
          'detalles.producto',
          'detalles.producto.preciosPorPais',
          'detalles.producto.tax',
          'usuario',
          'pais',
        ],
      });

      if (!notaCredito) {
        return res
          .status(404)
          .json({ message: 'Nota de crédito no encontrada' });
      }

      datosEmpresa = await this.datosEmpresaRepository.findOne({
        where: {},
      });

      if (!datosEmpresa) {
        return res
          .status(404)
          .json({ message: 'Datos de la empresa no configurados' });
      }
    } catch (validationError) {
      console.error('Error en validación inicial:', validationError);
      return res.status(500).json({
        message: 'Error al validar datos',
        error: validationError.message,
      });
    }

    try {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `${
          isPreview ? 'inline' : 'attachment'
        }; filename=nota_credito_${id}.pdf`,
      );

      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('error', (pdfError) => {
        console.error('Error en generación de PDF:', pdfError);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error al generar el PDF' });
        }
      });

      doc.pipe(res);

      const logoPath = path.join(process.cwd(), 'src', 'images', 'logo.png');
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 400, 0, { width: 120 });
        } catch (imageError) {
          console.warn('No se pudo cargar el logo:', imageError.message);
        }
      }

      const formatDate = (date: any): string => {
        if (!date) return 'N/A';

        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };

        if (date instanceof Date) {
          return date.toLocaleDateString('es-ES', options);
        }

        if (typeof date === 'string') {
          try {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('es-ES', options);
          } catch {
            return date;
          }
        }

        return 'N/A';
      };

      const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('es-HN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num);
      };

      const formatCurrency = (amount: number): string => {
        return `${simbolo} ${formatNumber(amount)}`;
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
        align: 'left' | 'center' | 'right' = 'left',
      ) => {
        try {
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
              align: align,
            });
        } catch (drawError) {
          console.error('Error dibujando celda:', drawError);
        }
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
        try {
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
        } catch (drawError) {
          console.error('Error dibujando celda derecha:', drawError);
        }
      };

      const calcularTotales = () => {
        const monto_nota = Number(notaCredito.monto);

        if (notaCredito.detalles && notaCredito.detalles.length > 0) {
          const detalle = notaCredito.detalles[0];
          const porcentaje_producto =
            Number(detalle.producto?.tax?.porcentaje || 0) / 100;
          const total_procentaje = monto_nota * porcentaje_producto;

          const porcentaje_descuento =
            Number(notaCredito.factura.descuento?.porcentaje || 0) / 100;
          const descuento_final =
            (monto_nota + total_procentaje) * porcentaje_descuento;
          const total_final = monto_nota + total_procentaje - descuento_final;

          return {
            subTotal: monto_nota,
            descuento: total_procentaje,
            totalFinal: total_final,
          };
        } else {
          return {
            subTotal: monto_nota,
            descuento: 0,
            totalFinal: monto_nota,
          };
        }
      };

      const totales = calcularTotales();

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('NOTA DE CRÉDITO', 50, 60, { align: 'left' });

      doc.fontSize(10).font('Helvetica');
      doc.text(`ID Nota de Crédito: ${notaCredito.id.substring(0, 8)}`, 50, 80);
      doc.text(
        `Fecha de Emisión: ${formatDate(notaCredito.createdAt)}`,
        50,
        92,
      );
      doc.text(
        `Factura Relacionada: ${notaCredito.factura.numero_factura}`,
        50,
        104,
      );
      doc.text(`Motivo: ${notaCredito.motivo}`, 50, 116);

      const infoEmpresaY = 160;
      doc.fontSize(10);
      doc
        .font('Helvetica-Bold')
        .text(`Propietaria: ${datosEmpresa.propietario}`, 50, infoEmpresaY);
      doc.font('Helvetica').text(datosEmpresa.direccion, 50, infoEmpresaY + 12);
      doc.text(`${datosEmpresa.correo}`, 50, infoEmpresaY + 24);
      doc.text(`RTN: ${datosEmpresa.rtn}`, 50, infoEmpresaY + 36);

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

      const cliente = notaCredito.factura.cliente;
      const clienteNombre = cliente.nombre || 'Cliente';
      const clienteRtn = (cliente as any).rtn || 'N/A';
      const clienteDireccion = (cliente as any).direccion || 'N/A';
      const clienteCiudad = (cliente as any).ciudad || 'N/A';

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
        'PRECIO',
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

      if (!notaCredito.detalles || notaCredito.detalles.length === 0) {
        const backgroundColor = '#FFFFFF';
        drawCell(
          50,
          currentY,
          colWidths[0],
          cellHeight,
          '1',
          backgroundColor,
          '#000000',
          8,
        );
        drawCell(
          130,
          currentY,
          colWidths[1],
          cellHeight,
          'Ajuste por nota de crédito',
          backgroundColor,
          '#000000',
          8,
        );
        drawCellRight(
          350,
          currentY,
          colWidths[2],
          cellHeight,
          formatCurrency(Number(notaCredito.monto)),
          backgroundColor,
          '#000000',
          8,
        );
        drawCellRight(
          450,
          currentY,
          colWidths[3],
          cellHeight,
          formatCurrency(Number(notaCredito.monto)),
          backgroundColor,
          '#000000',
          8,
        );
        currentY += cellHeight;
      } else {
        notaCredito.detalles.forEach((detalle, index) => {
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
              'PRECIO',
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
          const descripcion = detalle.producto?.nombre || 'Producto/Servicio';
          const precio = detalle?.producto?.preciosPorPais?.[0]?.precio || 0;

          const totalDetalle = Number(precio) * detalle.cantidad;

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
            formatCurrency(Number(precio)),
            backgroundColor,
            '#000000',
            8,
          );
          drawCellRight(
            450,
            currentY,
            colWidths[3],
            cellHeight,
            formatCurrency(totalDetalle),
            backgroundColor,
            '#000000',
            8,
          );

          currentY += cellHeight;
        });
      }

      const resumenTop = currentY + 20;
      const resumenCellHeight = 18;

      drawCell(
        350,
        resumenTop,
        80,
        resumenCellHeight,
        'Sub Total:',
        '#F8F9FA',
        '#000000',
        9,
        true,
        'right',
      );
      drawCellRight(
        430,
        resumenTop,
        120,
        resumenCellHeight,
        formatCurrency(totales.subTotal),
        '#F8F9FA',
        '#000000',
        9,
      );

      drawCell(
        350,
        resumenTop + resumenCellHeight,
        80,
        resumenCellHeight,
        'Descuento:',
        '#FFFFFF',
        '#000000',
        9,
        true,
        'right',
      );
      drawCellRight(
        430,
        resumenTop + resumenCellHeight,
        120,
        resumenCellHeight,
        formatCurrency(totales.descuento),
        '#FFFFFF',
        '#000000',
        9,
      );

      drawCell(
        350,
        resumenTop + resumenCellHeight * 2,
        80,
        resumenCellHeight + 5,
        'Total Final:',
        '#2E86AB',
        '#FFFFFF',
        10,
        true,
        'right',
      );
      drawCellRight(
        430,
        resumenTop + resumenCellHeight * 2,
        120,
        resumenCellHeight + 5,
        formatCurrency(totales.totalFinal),
        '#2E86AB',
        '#FFFFFF',
        10,
        true,
      );

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
        'center',
      );
      drawCell(
        50,
        resumenTop + 35,
        280,
        resumenCellHeight,
        'No. Correlativo de Orden de Compra:',
        '#F8F9FA',
      );
      drawCell(
        50,
        resumenTop + 50,
        280,
        resumenCellHeight,
        'No. Correlativo de Constancia de Registro Exonerado:',
        '#FFFFFF',
      );
      drawCell(
        50,
        resumenTop + 65,
        280,
        resumenCellHeight,
        'No. Identificación del Registro de la SAG:',
        '#F8F9FA',
      );

      drawCell(
        50,
        resumenTop + 85,
        135,
        resumenCellHeight,
        'ORIGINAL: CLIENTE',
        '#2E86AB',
        '#FFFFFF',
        6,
        true,
        'center',
      );
      drawCell(
        185,
        resumenTop + 85,
        145,
        resumenCellHeight,
        'COPIA: OBLIGADO TRIBUTARIO EMISOR',
        '#2E86AB',
        '#FFFFFF',
        6,
        true,
        'center',
      );

      const footerY = Math.max(resumenTop + resumenCellHeight * 6 + 30, 700);
      drawCell(
        50,
        footerY,
        500,
        25,
        'NOTA DE CRÉDITO APLICADA CORRECTAMENTE',
        '#2E86AB',
        '#FFFFFF',
        10,
        true,
        'center',
      );

      doc.end();
    } catch (pdfError) {
      console.error('Error durante generación de PDF:', pdfError);

      if (res.headersSent) {
        console.error('Headers ya enviados, no se puede enviar error JSON');
        res.end();
      } else {
        res.status(500).json({
          message: 'Error al generar la nota de crédito PDF',
          error: pdfError.message,
        });
      }
    }
  }

  async generarNotaCreditoPreview(
    id: string,
    @Res() res: Response,
    user: User,
  ) {
    try {
      return this.generarNotaCreditoPDF(id, res, true, user);
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
