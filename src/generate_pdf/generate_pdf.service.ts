import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from 'src/citas/entities/cita.entity';
import { Repository } from 'typeorm';
import { Injectable, Res } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { EstadoCita } from 'src/interfaces/estados_citas';
import * as path from 'path';

@Injectable()
export class GeneratePdfService {
  private readonly TASA_IMPUESTO = 0.15;
  constructor(
    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,
  ) {}

  async generarFactura(id: string, @Res() res: Response) {
    try {
      const cita = await this.citaRepo.findOne({
        where: { id },
        relations: [
          'medico',
          'user',
          'finca',
          'subServicio',
          'animales',
          'insumosUsados',
          'insumosUsados.insumo',
        ],
      });

      if (!cita) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }

      if (cita.estado !== EstadoCita.COMPLETADA) {
        return res.status(400).json({
          message: `No se puede generar factura: el estado actual de la cita es "${cita.estado}"`,
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=factura_${cita.id}.pdf`,
      );

      const doc = new PDFDocument({ margin: 50 });

      doc.on('error', (err) => {
        console.error('Error al generar PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error al generar el PDF' });
        }
      });

      doc.pipe(res);

      const logoPath = path.join(
        process.cwd(),
        'src',
        'images',
        'logo-analiza.png',
      );
      doc.image(logoPath, 50, 40, { width: 100 });

      doc.fontSize(20).text('FACTURA VETERINARIA', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`);
      doc.text(`Factura N°: ${cita.id}`);
      doc.text(`Fecha de la cita: ${cita.fecha}`);
      doc.moveDown();

      doc.fontSize(14).text('Datos del Cliente', { underline: true });
      doc.fontSize(12).text(`Nombre: ${cita.user.name}`);
      doc.text(`Email: ${cita.user.email}`);
      doc.text(`Teléfono: ${cita.user.telefono}`);
      doc.moveDown();

      doc.fontSize(14).text('Datos del Médico', { underline: true });
      doc.fontSize(12).text(`Nombre: ${cita.medico.usuario.name}`);
      doc.moveDown();

      doc.fontSize(14).text('Detalles de la Cita', { underline: true });
      doc.fontSize(12).text(`Finca: ${cita.finca.nombre_finca}`);
      doc.text(`Servicio: ${cita.subServicio.nombre}`);
      doc.text(
        `Animales: ${cita.animales.map((a) => a.identificador).join(', ')}`,
      );
      doc.text(`Hora Inicio: ${cita.horaInicio}`);
      doc.text(`Hora Fin: ${cita.horaFin}`);
      doc.text(`Duración: ${cita.duracion} hora(as)`);
      doc.moveDown();

      if (cita.insumosUsados && cita.insumosUsados.length > 0) {
        doc.fontSize(14).text('Insumos Utilizados', { underline: true });
        doc.moveDown(0.5);

        const startY = doc.y;
        let currentY = startY;

        doc.font('Helvetica-Bold');
        doc.text('Descripción', 50, currentY);
        doc.text('Cantidad', 250, currentY);
        doc.text('P. Unitario', 350, currentY);
        doc.text('Subtotal', 450, currentY);
        doc.font('Helvetica');
        currentY += 25;

        doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
        currentY += 10;

        let totalInsumos = 0;
        cita.insumosUsados.forEach((insumo) => {
          const precioUnitario =
            typeof insumo.precioUnitario === 'string'
              ? parseFloat(insumo.precioUnitario)
              : insumo.precioUnitario;

          const subtotal = insumo.cantidad * precioUnitario;
          totalInsumos += subtotal;

          doc.text(insumo.insumo.nombre, 50, currentY);
          doc.text(insumo.cantidad.toString(), 250, currentY);
          doc.text(
            `${cita.user.pais.simbolo_moneda}${precioUnitario.toFixed(2)}`,
            350,
            currentY,
          );
          doc.text(
            `${cita.user.pais.simbolo_moneda}${subtotal.toFixed(2)}`,
            450,
            currentY,
          );
          currentY += 20;
        });

        doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
        currentY += 10;
        doc.font('Helvetica-Bold');
        doc.text('Total Insumos:', 350, currentY);
        doc.text(
          `${cita.user.pais.simbolo_moneda}${totalInsumos.toFixed(2)}`,
          450,
          currentY,
        );
        doc.font('Helvetica');
        currentY += 30;

        doc.y = currentY;
      } else {
        doc.fontSize(14).text('Insumos Utilizados', { underline: true });
        doc.fontSize(12).text('No se utilizaron insumos en esta cita');
        doc.moveDown();
      }

      doc.fontSize(12).text('Resumen de Costos', { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12);
      doc.text(
        `Costo del servicio: ${cita.user.pais.simbolo_moneda}${parseFloat(
          cita.totalPagar.toString(),
        ).toFixed(2)}`,
        { align: 'right' },
      );

      if (cita.insumosUsados && cita.insumosUsados.length > 0) {
        const totalInsumos = cita.insumosUsados.reduce((sum, insumo) => {
          const precio =
            typeof insumo.precioUnitario === 'string'
              ? parseFloat(insumo.precioUnitario)
              : insumo.precioUnitario;
          return sum + insumo.cantidad * precio;
        }, 0);
        doc.text(
          `Total insumos: ${
            cita.user.pais.simbolo_moneda
          }${totalInsumos.toFixed(2)}`,
          {
            align: 'right',
          },
        );
      }

      doc.moveDown(0.5);
      doc.font('Helvetica-Bold');
      doc.text(
        `Total Final: ${cita.user.pais.simbolo_moneda}${parseFloat(
          cita.totalFinal.toString(),
        ).toFixed(2)}`,
        { align: 'right' },
      );
      doc.font('Helvetica');

      const leftMargin = 50;
      const rightMargin = 50;
      const pageWidth = 595.28;
      const contentWidth = pageWidth - leftMargin - rightMargin;

      const footerY = Math.max(doc.y + 40, 650);

      doc
        .moveTo(leftMargin, footerY - 10)
        .lineTo(pageWidth - rightMargin, footerY - 10)
        .strokeColor('#CCCCCC')
        .stroke();

      doc.fontSize(10).text('Gracias por su preferencia', leftMargin, footerY, {
        width: contentWidth,
        align: 'center',
      });

      /* doc
        .fontSize(10)
        .text(
          'Firma del veterinario: ________________________',
          leftMargin,
          footerY + 20,
          {
            width: contentWidth,
            align: 'center',
          },
        ); */

      doc.end();
    } catch (error) {
      console.error('Error en generarFactura:', error);
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error al generar la factura',
          error: error.message,
        });
      }
    }
  }
}
