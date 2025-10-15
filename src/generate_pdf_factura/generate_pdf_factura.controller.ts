import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { FacturaPdfService } from './generate_pdf_factura.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Controller('facturas')
export class FacturaPdfController {
  constructor(private readonly facturaPdfService: FacturaPdfService) {}

  @Get(':id/pdf')
  @Auth()
  async generarFacturaPDF(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    return this.facturaPdfService.generarFacturaPDF(id, res, false, user);
  }

  @Get(':id/preview')
  @Auth()
  async generarFacturaPreview(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    return this.facturaPdfService.generarFacturaPreview(id, res, user);
  }
}
