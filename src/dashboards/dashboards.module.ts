import { Module } from '@nestjs/common';

import { DashboardsController } from './dashboards.controller';
import { DashboardService } from './dashboards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaEncabezado } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { FacturaDetalle } from 'src/factura_detalle/entities/factura_detalle.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { CompraInsumo } from 'src/compra-insumos/entities/compra-insumo.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';
import { ProduccionGanadera } from 'src/produccion_ganadera/entities/produccion_ganadera.entity';

@Module({
  controllers: [DashboardsController],
  imports: [
    TypeOrmModule.forFeature([
      FacturaEncabezado,
      FacturaDetalle,
      Cliente,
      User,
      Compra,
      CompraInsumo,
      AnimalFinca,
      Cliente,
      FincasGanadero,
      Cita,
      ProduccionFinca,
      ProduccionGanadera,
    ]),
    AuthModule,
    AuthClientesModule,
  ],
  providers: [DashboardService],
})
export class DashboardsModule {}
