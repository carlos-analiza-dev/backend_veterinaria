import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosProductosService } from './datos-productos.service';
import { DatosProductosController } from './datos-productos.controller';
import { DatosProducto } from './entities/datos-producto.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatosProducto, Sucursal, SubServicio])],
  controllers: [DatosProductosController],
  providers: [DatosProductosService],
  exports: [DatosProductosService],
})
export class DatosProductosModule {}
