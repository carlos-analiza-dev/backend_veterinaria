import { Module } from '@nestjs/common';
import { DescuentosProductoService } from './descuentos_producto.service';
import { DescuentosProductoController } from './descuentos_producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DescuentosProducto } from './entities/descuentos_producto.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Module({
  controllers: [DescuentosProductoController],
  imports: [
    TypeOrmModule.forFeature([DescuentosProducto, SubServicio, Pai, Proveedor]),
  ],
  providers: [DescuentosProductoService],
})
export class DescuentosProductoModule {}
