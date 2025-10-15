import { Module } from '@nestjs/common';
import { GenerateFacturaTermicaService } from './generate_factura_termica.service';
import { GenerateFacturaTermicaController } from './generate_factura_termica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { DatosEmpresa } from 'src/datos-empresa/entities/datos-empresa.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [GenerateFacturaTermicaController],
  imports: [
    TypeOrmModule.forFeature([FacturaEncabezado, DatosEmpresa, User]),
    AuthModule,
  ],
  providers: [GenerateFacturaTermicaService],
})
export class GenerateFacturaTermicaModule {}
