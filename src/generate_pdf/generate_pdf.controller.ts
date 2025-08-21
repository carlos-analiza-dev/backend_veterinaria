import { Controller, Get, Param, Res } from '@nestjs/common';
import { GeneratePdfService } from './generate_pdf.service';
import { Response } from 'express';

@Controller('generate-pdf')
export class GeneratePdfController {
  constructor(private readonly generatePdfService: GeneratePdfService) {}

  @Get(':id')
  generar(@Param('id') id: string, @Res() res: Response) {
    return this.generatePdfService.generarFactura(id, res);
  }
}
