import { Module } from '@nestjs/common';

import { HistorialDetallesController } from './historial_detalles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialDetalle } from './entities/historial_detalle.entity';
import { HistorialClinico } from 'src/historial_clinico/entities/historial_clinico.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { HistorialDetalleService } from './historial_detalles.service';

@Module({
  controllers: [HistorialDetallesController],
  imports: [
    TypeOrmModule.forFeature([HistorialDetalle, HistorialClinico, SubServicio]),
  ],
  providers: [HistorialDetalleService],
})
export class HistorialDetallesModule {}
