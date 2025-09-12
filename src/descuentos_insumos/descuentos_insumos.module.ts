import { Module } from '@nestjs/common';
import { DescuentosInsumosService } from './descuentos_insumos.service';
import { DescuentosInsumosController } from './descuentos_insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DescuentosInsumo } from './entities/descuentos_insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Module({
  controllers: [DescuentosInsumosController],
  imports: [
    TypeOrmModule.forFeature([DescuentosInsumo, Insumo, Pai, Proveedor]),
  ],
  providers: [DescuentosInsumosService],
})
export class DescuentosInsumosModule {}
