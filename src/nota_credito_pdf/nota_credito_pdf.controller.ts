import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { NotaCreditoPdfService } from './nota_credito_pdf.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Controller('nota-credito-pdf')
export class NotaCreditoPdfController {
  constructor(private readonly notaCreditoPdfService: NotaCreditoPdfService) {}

  @Get(':id')
  @Auth()
  async generarNotaCreditoPDF(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    return this.notaCreditoPdfService.generarNotaCreditoPDF(
      id,
      res,
      false,
      user,
    );
  }

  @Get(':id/preview')
  @Auth()
  async generarNotaCreditoPreview(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    return this.notaCreditoPdfService.generarNotaCreditoPreview(id, res, user);
  }
}
