import { Injectable } from '@nestjs/common';
import { CreatePedidoDetalleDto } from './dto/create-pedido_detalle.dto';
import { UpdatePedidoDetalleDto } from './dto/update-pedido_detalle.dto';

@Injectable()
export class PedidoDetallesService {
  create(createPedidoDetalleDto: CreatePedidoDetalleDto) {
    return 'This action adds a new pedidoDetalle';
  }

  findAll() {
    return `This action returns all pedidoDetalles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pedidoDetalle`;
  }

  update(id: number, updatePedidoDetalleDto: UpdatePedidoDetalleDto) {
    return `This action updates a #${id} pedidoDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} pedidoDetalle`;
  }
}
