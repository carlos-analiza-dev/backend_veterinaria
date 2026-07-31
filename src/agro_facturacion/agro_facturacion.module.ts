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
import { AgroFacturaDetalle } from './entities/agro_factura_detalle.entity';
import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';
import { AgroCliente } from 'src/agro_clientes/entities/agro_cliente.entity';
import { LoteAgroProducto } from 'src/agro-compras-productos/entities/lote-agro-compra.entity';
import { AgroMovimientosLote } from 'src/movimientos_lotes/entities/agro_movimientos_lotes.entity';
import { AuditoriaFacturacion } from './entities/audit_facturacion.entity';

@Module({
  controllers: [AgroFacturacionController, AgroRangoFacturaController],
  imports: [
    TypeOrmModule.forFeature([
      AgroFacturacion,
      AgroRangoFactura,
      AuditoriaAgroFacturacion,
      DatosAgroservicio,
      AgroFacturaDetalle,
      AgroProducto,
      AgroCliente,
      LoteAgroProducto,
      AgroMovimientosLote,
      AuditoriaFacturacion,
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
