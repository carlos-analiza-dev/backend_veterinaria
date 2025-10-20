import { Module } from '@nestjs/common';
import { PedidoDetallesService } from './pedido_detalles.service';
import { PedidoDetallesController } from './pedido_detalles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoDetalle } from './entities/pedido_detalle.entity';

@Module({
  controllers: [PedidoDetallesController],
  imports: [TypeOrmModule.forFeature([PedidoDetalle])],
  providers: [PedidoDetallesService],
})
export class PedidoDetallesModule {}
