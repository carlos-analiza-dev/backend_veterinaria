import { Module } from '@nestjs/common';
import { EscalasProductoService } from './escalas_producto.service';
import { EscalasProductoController } from './escalas_producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscalasProducto } from './entities/escalas_producto.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Pai } from 'src/pais/entities/pai.entity';

@Module({
  controllers: [EscalasProductoController],
  imports: [
    TypeOrmModule.forFeature([EscalasProducto, SubServicio, Proveedor, Pai]),
  ],
  providers: [EscalasProductoService],
})
export class EscalasProductoModule {}
