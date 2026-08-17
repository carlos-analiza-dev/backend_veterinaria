import { Module } from '@nestjs/common';
import { NotaCreditoPdfService } from './nota_credito_pdf.service';
import { NotaCreditoPdfController } from './nota_credito_pdf.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import { NotaCredito } from 'src/nota_credito/entities/nota_credito.entity';
import { DatosEmpresa } from 'src/datos-empresa/entities/datos-empresa.entity';
import { AgroNotaCredito } from 'src/nota_credito/entities/nota_agro_credito.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';

@Module({
  controllers: [NotaCreditoPdfController],
  imports: [
    TypeOrmModule.forFeature([
      User,
      NotaCredito,
      DatosEmpresa,
      AgroNotaCredito,
      DatosAgroservicio,
    ]),
    AuthModule,
  ],
  providers: [NotaCreditoPdfService, AgroservicioValidationService],
})
export class NotaCreditoPdfModule {}
