import { Module } from '@nestjs/common';
import { DetallesServicioReproductivoService } from './detalles_servicio_reproductivo.service';
import { DetallesServicioReproductivoController } from './detalles_servicio_reproductivo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleServicio } from './entities/detalles_servicio_reproductivo.entity';

@Module({
  controllers: [DetallesServicioReproductivoController],
  imports: [TypeOrmModule.forFeature([DetalleServicio])],
  providers: [DetallesServicioReproductivoService],
})
export class DetallesServicioReproductivoModule {}
