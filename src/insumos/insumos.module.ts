import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { CitaInsumo } from 'src/cita_insumos/entities/cita_insumo.entity';

@Module({
  controllers: [InsumosController],
  imports: [TypeOrmModule.forFeature([Insumo, CitaInsumo, Inventario])],
  providers: [InsumosService],
})
export class InsumosModule {}
