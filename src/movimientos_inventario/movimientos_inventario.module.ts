import { Module } from '@nestjs/common';
import { MovimientosInventarioService } from './movimientos_inventario.service';
import { MovimientosInventarioController } from './movimientos_inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInventario } from './entities/movimientos_inventario.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [MovimientosInventarioController],
  imports:[TypeOrmModule.forFeature([MovimientosInventario,Lote,Sucursal,User]),AuthModule],
  providers: [MovimientosInventarioService],
})
export class MovimientosInventarioModule {}