import { Module } from '@nestjs/common';
import { InventarioProductosService } from './inventario_productos.service';
import { InventarioProductosController } from './inventario_productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioProducto } from './entities/inventario_producto.entity';
import { ProductosAgroservicio } from 'src/productos_agroservicio/entities/productos_agroservicio.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';

@Module({
  controllers: [InventarioProductosController],
  imports: [
    TypeOrmModule.forFeature([
      InventarioProducto,
      ProductosAgroservicio,
      SubServicio,
    ]),
  ],
  providers: [InventarioProductosService],
})
export class InventarioProductosModule {}
