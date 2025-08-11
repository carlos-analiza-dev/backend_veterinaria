import { Module } from '@nestjs/common';
import { ProductosAgroservicioService } from './productos_agroservicio.service';
import { ProductosAgroservicioController } from './productos_agroservicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioProducto } from 'src/inventario_productos/entities/inventario_producto.entity';
import { ProductosAgroservicio } from './entities/productos_agroservicio.entity';
import { CitaProducto } from 'src/cita_productos/entities/cita_producto.entity';

@Module({
  controllers: [ProductosAgroservicioController],
  imports: [
    TypeOrmModule.forFeature([
      ProductosAgroservicio,
      InventarioProducto,
      CitaProducto,
    ]),
  ],
  providers: [ProductosAgroservicioService],
})
export class ProductosAgroservicioModule {}
