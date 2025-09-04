import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompraInsumosService } from './compra-insumos.service';
import { CompraInsumosController } from './compra-insumos.controller';
import { CompraInsumo } from './entities/compra-insumo.entity';
import { DetalleCompraInsumo } from './entities/detalle-compra-insumo.entity';
import { InvLoteInsumo } from './entities/inv-lote-insumo.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CompraInsumosController],
  providers: [CompraInsumosService],
  imports: [
    TypeOrmModule.forFeature([
      CompraInsumo,
      DetalleCompraInsumo,
      InvLoteInsumo,
      Sucursal,
      Proveedor,
      Insumo,
    ]),
    AuthModule,
  ],
  exports: [CompraInsumosService, TypeOrmModule],
})
export class CompraInsumosModule {}