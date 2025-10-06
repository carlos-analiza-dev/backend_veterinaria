import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { FacturaPdfService } from './generate_pdf_factura.service';

@Controller('facturas')
export class FacturaPdfController {
  constructor(private readonly facturaPdfService: FacturaPdfService) {}

  @Get(':id/pdf')
  async generarFacturaPDF(@Param('id') id: string, @Res() res: Response) {
    return this.facturaPdfService.generarFacturaPDF(id, res);
  }

  @Get(':id/preview')
  async generarFacturaPreview(@Param('id') id: string, @Res() res: Response) {
    return this.facturaPdfService.generarFacturaPreview(id, res);
  }
}
