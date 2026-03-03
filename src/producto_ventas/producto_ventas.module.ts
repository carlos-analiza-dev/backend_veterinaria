import { Module } from '@nestjs/common';
import { ProductoVentasService } from './producto_ventas.service';
import { ProductoVentasController } from './producto_ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoVenta } from './entities/producto_venta.entity';
import { ProductosGanaderia } from 'src/productos_ganaderia/entities/productos_ganaderia.entity';

@Module({
  controllers: [ProductoVentasController],
  imports: [TypeOrmModule.forFeature([ProductoVenta, ProductosGanaderia])],
  providers: [ProductoVentasService],
})
export class ProductoVentasModule {}
