import { Module } from '@nestjs/common';
import { EscalasProductoService } from './escalas_producto.service';
import { EscalasProductoController } from './escalas_producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscalasProducto } from './entities/escalas_producto.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';

@Module({
  controllers: [EscalasProductoController],
  imports: [TypeOrmModule.forFeature([EscalasProducto, SubServicio])],
  providers: [EscalasProductoService],
})
export class EscalasProductoModule {}
