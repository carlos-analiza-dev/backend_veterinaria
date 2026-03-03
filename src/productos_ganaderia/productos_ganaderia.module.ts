import { Module } from '@nestjs/common';
import { ProductosGanaderiaService } from './productos_ganaderia.service';
import { ProductosGanaderiaController } from './productos_ganaderia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosGanaderia } from './entities/productos_ganaderia.entity';
import { ProductoVenta } from 'src/producto_ventas/entities/producto_venta.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [ProductosGanaderiaController],
  imports: [
    TypeOrmModule.forFeature([ProductosGanaderia, ProductoVenta, Cliente]),
  ],
  providers: [ProductosGanaderiaService],
})
export class ProductosGanaderiaModule {}
