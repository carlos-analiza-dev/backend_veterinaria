import { Module } from '@nestjs/common';
import { ServicioInsumosService } from './servicio_insumos.service';
import { ServicioInsumosController } from './servicio_insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioInsumo } from './entities/servicio_insumo.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Module({
  controllers: [ServicioInsumosController],
  imports: [TypeOrmModule.forFeature([ServicioInsumo, SubServicio, Insumo])],
  providers: [ServicioInsumosService],
})
export class ServicioInsumosModule {}
