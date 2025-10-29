import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { HistorialDocumentosService } from './historial_documentos.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

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
}
