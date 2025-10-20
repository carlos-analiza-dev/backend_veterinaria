import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoDetalleDto } from './create-pedido_detalle.dto';

export class UpdatePedidoDetalleDto extends PartialType(CreatePedidoDetalleDto) {}
