import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { GenerateFacturaTermicaService } from './generate_factura_termica.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Controller('generate-factura-termica')
export class GenerateFacturaTermicaController {
  constructor(
    private readonly generateFacturaTermicaService: GenerateFacturaTermicaService,
  ) {}

  @Get(':id/imprimir')
  @Auth()
  async imprimirFactura(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    return this.generateFacturaTermicaService.imprimirDirecto(id, res, user);
  }

  @Get(':id/archivo-texto')
  @Auth()
  async descargarArchivoTexto(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    return this.generateFacturaTermicaService.generarFacturaTermica(
      id,
      res,
      user,
    );
  }

  @Get(':id/preview')
  @Auth()
  async previewFactura(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    return this.generateFacturaTermicaService.generarFacturaTermica(
      id,
      res,
      user,
    );
  }
}
