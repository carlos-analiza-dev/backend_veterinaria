import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { LoteInsumo } from '../lotes/entities/lote-insumo.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { AuthModule } from '../auth/auth.module';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Module({
  controllers: [ComprasController],
  providers: [ComprasService],
  imports: [
    TypeOrmModule.forFeature([
      Compra,
      CompraDetalle,
      Lote,
      LoteInsumo,
      Sucursal,
      Proveedor,
      SubServicio,
      Insumo,
    ]),
    AuthModule,
  ],
  exports: [ComprasService, TypeOrmModule],
})
export class ComprasModule {}
