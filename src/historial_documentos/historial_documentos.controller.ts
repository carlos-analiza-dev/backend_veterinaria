import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { HistorialDocumentosService } from './historial_documentos.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('historial-documentos')
export class HistorialDocumentosController {
  constructor(
    private readonly historialDocumentosService: HistorialDocumentosService,
  ) {}

  @Post('upload/:detalleId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadDocumentos(
    @Param('detalleId') detalleId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.historialDocumentosService.uploadDocumentos(detalleId, files);
  }

  @Get('detalle/:detalleId')
  async getDocumentosByDetalle(@Param('detalleId') detalleId: string) {
    return this.historialDocumentosService.getDocumentosByDetalle(detalleId);
  }

  @Delete(':documentoId')
  async deleteDocumento(@Param('documentoId') documentoId: string) {
    return this.historialDocumentosService.deleteDocumento(documentoId);
  }

  @Get('descargar/:id')
  async downloadDocumento(@Param('id') id: string, @Res() res: Response) {
    const { stream, filename, mimeType } =
      await this.historialDocumentosService.downloadDocumento(id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    stream.getStream().pipe(res);
  }
}
