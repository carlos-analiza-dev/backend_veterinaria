import { Module } from '@nestjs/common';
import { CitaInsumosService } from './cita_insumos.service';
import { CitaInsumosController } from './cita_insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitaInsumo } from './entities/cita_insumo.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';

@Module({
  controllers: [CitaInsumosController],
  imports: [TypeOrmModule.forFeature([CitaInsumo, Cita, Insumo, Inventario])],
  providers: [CitaInsumosService],
})
export class CitaInsumosModule {}
