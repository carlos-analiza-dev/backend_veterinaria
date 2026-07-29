import { Module } from '@nestjs/common';
import { AgroImpuestosService } from './agro_impuestos.service';
import { AgroImpuestosController } from './agro_impuestos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgroImpuesto } from './entities/agro_impuesto.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AuditoriaImpuesto } from './entities/audit-agro-impuestos.entity';

@Module({
  controllers: [AgroImpuestosController],
  imports: [
    TypeOrmModule.forFeature([
      AgroImpuesto,
      DatosAgroservicio,
      AuditoriaImpuesto,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [AgroImpuestosService, AgroservicioValidationService],
})
export class AgroImpuestosModule {}
