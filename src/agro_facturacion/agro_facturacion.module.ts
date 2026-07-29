import { Module } from '@nestjs/common';
import { AgroFacturacionService } from './agro_facturacion.service';
import { AgroFacturacionController } from './agro_facturacion.controller';
import { AgroRangoFacturaController } from './agro_rango_factura.controller';
import { AgroRangoFacturaService } from './agro-rango-factura.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgroFacturacion } from './entities/agro_facturacion.entity';
import { AgroRangoFactura } from './entities/rangos-agro-factura.entity';
import { AuditoriaAgroFacturacion } from './entities/auditoria_facturacion.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { EmpleadosAgroModule } from 'src/empleados-agro/empleados-agro.module';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';

@Module({
  controllers: [AgroFacturacionController, AgroRangoFacturaController],
  imports: [
    TypeOrmModule.forFeature([
      AgroFacturacion,
      AgroRangoFactura,
      AuditoriaAgroFacturacion,
      DatosAgroservicio,
    ]),
    AuthClientesModule,
    EmpleadosAgroModule,
  ],
  providers: [
    AgroFacturacionService,
    AgroRangoFacturaService,
    AgroservicioValidationService,
  ],
})
export class AgroFacturacionModule {}
