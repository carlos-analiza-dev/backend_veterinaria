import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ComprasController],
  providers: [ComprasService],
  imports: [
    TypeOrmModule.forFeature([
      Compra,
      CompraDetalle,
      Lote,
      Sucursal,
      Proveedor,
      Insumo,
    ]),
    AuthModule,
  ],
  exports: [ComprasService, TypeOrmModule],
})
export class ComprasModule {}