import { Module } from '@nestjs/common';
import { FacturaEncabezadoService } from './factura_encabezado.service';
import { FacturaEncabezadoController } from './factura_encabezado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaEncabezado } from './entities/factura_encabezado.entity';
import { RangoFactura } from 'src/rangos-factura/entities/rango-factura.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FacturaDetalle } from 'src/factura_detalle/entities/factura_detalle.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [FacturaEncabezadoController],
  imports: [
    TypeOrmModule.forFeature([
      FacturaEncabezado,
      RangoFactura,
      Cliente,
      FacturaDetalle,
      SubServicio,
    ]),
    AuthModule,
  ],
  providers: [FacturaEncabezadoService],
})
export class FacturaEncabezadoModule {}
