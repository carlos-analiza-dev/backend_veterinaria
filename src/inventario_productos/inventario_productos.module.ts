import { Module } from '@nestjs/common';
import { InventarioProductosService } from './inventario_productos.service';
import { InventarioProductosController } from './inventario_productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioProducto } from './entities/inventario_producto.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';

@Module({
  controllers: [InventarioProductosController],
  imports: [TypeOrmModule.forFeature([InventarioProducto, SubServicio])],
  providers: [InventarioProductosService],
})
export class InventarioProductosModule {}
