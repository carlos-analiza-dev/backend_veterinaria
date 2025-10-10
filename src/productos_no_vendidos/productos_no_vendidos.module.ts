import { Module } from '@nestjs/common';
import { ProductosNoVendidosService } from './productos_no_vendidos.service';
import { ProductosNoVendidosController } from './productos_no_vendidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosNoVendido } from './entities/productos_no_vendido.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [ProductosNoVendidosController],
  imports: [
    TypeOrmModule.forFeature([ProductosNoVendido, SubServicio, Sucursal, User]),
    AuthModule,
  ],
  providers: [ProductosNoVendidosService],
})
export class ProductosNoVendidosModule {}
