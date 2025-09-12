import { Module } from '@nestjs/common';
import { EscalasInsumosService } from './escalas_insumos.service';
import { EscalasInsumosController } from './escalas_insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscalasInsumo } from './entities/escalas_insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Module({
  controllers: [EscalasInsumosController],
  imports: [TypeOrmModule.forFeature([EscalasInsumo, Insumo, Pai, Proveedor])],
  providers: [EscalasInsumosService],
})
export class EscalasInsumosModule {}
