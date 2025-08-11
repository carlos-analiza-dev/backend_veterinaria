import { Module } from '@nestjs/common';
import { CitaProductosService } from './cita_productos.service';
import { CitaProductosController } from './cita_productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitaProducto } from './entities/cita_producto.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { ProductosAgroservicio } from 'src/productos_agroservicio/entities/productos_agroservicio.entity';
import { InventarioProducto } from 'src/inventario_productos/entities/inventario_producto.entity';

@Module({
  controllers: [CitaProductosController],
  imports: [
    TypeOrmModule.forFeature([
      CitaProducto,
      Cita,
      ProductosAgroservicio,
      InventarioProducto,
    ]),
  ],
  providers: [CitaProductosService],
})
export class CitaProductosModule {}
