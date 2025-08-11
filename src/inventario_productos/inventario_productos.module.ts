import { Module } from '@nestjs/common';
import { InventarioProductosService } from './inventario_productos.service';
import { InventarioProductosController } from './inventario_productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioProducto } from './entities/inventario_producto.entity';
import { ProductosAgroservicio } from 'src/productos_agroservicio/entities/productos_agroservicio.entity';

@Module({
  controllers: [InventarioProductosController],
  imports: [
    TypeOrmModule.forFeature([InventarioProducto, ProductosAgroservicio]),
  ],
  providers: [InventarioProductosService],
})
export class InventarioProductosModule {}
