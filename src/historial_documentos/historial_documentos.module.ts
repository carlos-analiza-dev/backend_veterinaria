import { Module } from '@nestjs/common';
import { HistorialDocumentosService } from './historial_documentos.service';
import { HistorialDocumentosController } from './historial_documentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialDocumento } from './entities/historial_documento.entity';
import { HistorialDetalle } from 'src/historial_detalles/entities/historial_detalle.entity';

@Module({
  controllers: [HistorialDocumentosController],
  imports: [TypeOrmModule.forFeature([HistorialDocumento, HistorialDetalle])],
  providers: [HistorialDocumentosService],
})
export class HistorialDocumentosModule {}
