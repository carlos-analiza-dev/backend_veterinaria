import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from 'src/pedido_detalles/entities/pedido_detalle.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Lote } from 'src/lotes/entities/lote.entity';

@Module({
  controllers: [PedidosController],
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      PedidoDetalle,
      Cliente,
      Sucursal,
      SubServicio,
      Lote,
    ]),
    AuthClientesModule,
    AuthModule,
  ],
  providers: [PedidosService],
})
export class PedidosModule {}
