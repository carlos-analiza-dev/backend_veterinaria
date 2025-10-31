import { Module } from '@nestjs/common';
import { NotaCreditoPdfService } from './nota_credito_pdf.service';
import { NotaCreditoPdfController } from './nota_credito_pdf.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import { NotaCredito } from 'src/nota_credito/entities/nota_credito.entity';
import { DatosEmpresa } from 'src/datos-empresa/entities/datos-empresa.entity';

@Module({
  controllers: [NotaCreditoPdfController],
  imports: [
    TypeOrmModule.forFeature([User, NotaCredito, DatosEmpresa]),
    AuthModule,
  ],
  providers: [NotaCreditoPdfService],
})
export class NotaCreditoPdfModule {}
