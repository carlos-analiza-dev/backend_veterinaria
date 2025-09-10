import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosProductosService } from './datos-productos.service';
import { DatosProductosController } from './datos-productos.controller';
import { DatosProducto } from './entities/datos-producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatosProducto])],
  controllers: [DatosProductosController],
  providers: [DatosProductosService],
  exports: [DatosProductosService],
})
export class DatosProductosModule {}