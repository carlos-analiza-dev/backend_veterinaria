import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  ParseUUIDPipe,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { LogosAgroserviciosService } from './logos-agroservicios.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';

@Controller('logos-agroservicios')
export class LogosAgroserviciosController {
  constructor(
    private readonly logosAgroserviciosService: LogosAgroserviciosService,
  ) {}

  @Post('upload/:agroId')
  @UseInterceptors(FileInterceptor('file'))
  @AuthCliente()
  async uploadLogoImage(
    @Param('agroId', ParseUUIDPipe) agroId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.logosAgroserviciosService.uploadProfileImage(agroId, file);
  }

  @Get(':propietarioId')
  findAll(@Param('propietarioId', ParseUUIDPipe) propietarioId: string) {
    return this.logosAgroserviciosService.findAll(propietarioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logosAgroserviciosService.remove(id);
  }
}
