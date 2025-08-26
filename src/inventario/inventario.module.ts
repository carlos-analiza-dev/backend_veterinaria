import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Pai } from 'src/pais/entities/pai.entity';

@Module({
  controllers: [InventarioController],
  imports: [TypeOrmModule.forFeature([Inventario, Insumo, Pai])],
  providers: [InventarioService],
})
export class InventarioModule {}
