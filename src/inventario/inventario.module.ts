import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Module({
  controllers: [InventarioController],
  imports: [TypeOrmModule.forFeature([Inventario, Insumo])],
  providers: [InventarioService],
})
export class InventarioModule {}
