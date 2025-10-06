import { Module } from '@nestjs/common';
import { FacturaPdfController } from './generate_pdf_factura.controller';
import { FacturaPdfService } from './generate_pdf_factura.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { DatosEmpresa } from 'src/datos-empresa/entities/datos-empresa.entity';

@Module({
  controllers: [FacturaPdfController],
  imports: [TypeOrmModule.forFeature([FacturaEncabezado, DatosEmpresa])],
  providers: [FacturaPdfService],
})
export class GeneratePdfFacturaModule {}
