import { Module } from '@nestjs/common';

import { DashboardsController } from './dashboards.controller';
import { DashboardService } from './dashboards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { FacturaDetalle } from 'src/factura_detalle/entities/factura_detalle.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [DashboardsController],
  imports: [
    TypeOrmModule.forFeature([
      FacturaEncabezado,
      FacturaDetalle,
      Cliente,
      User,
    ]),
    AuthModule,
  ],
  providers: [DashboardService],
})
export class DashboardsModule {}
