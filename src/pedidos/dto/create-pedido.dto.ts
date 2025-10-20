import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEnum,
  IsPositive,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPedido } from '../entities/pedido.entity';

export class PedidoDetalleDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido.' })
  id_producto: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número válido.' })
  @IsPositive({ message: 'La cantidad debe ser mayor que cero.' })
  cantidad: number;

  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @IsPositive({ message: 'El precio debe ser mayor que cero.' })
  @Min(0.01)
  precio: number;

  @IsNumber({}, { message: 'El total del producto debe ser un número válido.' })
  @IsPositive({ message: 'El total del producto debe ser mayor que cero.' })
  total: number;
}

export class CreatePedidoDto {
  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido.' })
  id_cliente: string;

  @IsUUID('4', { message: 'El ID de la sucursal debe ser un UUID válido.' })
  @IsOptional()
  id_sucursal?: string;

  @IsNumber({}, { message: 'El total del pedido debe ser un número válido.' })
  @IsPositive({ message: 'El total del pedido debe ser mayor que cero.' })
  total: number;

  @IsEnum(EstadoPedido, {
    message:
      'El estado del pedido debe ser uno de los siguientes valores: pendiente, facturado o cancelado.',
  })
  @IsOptional()
  estado?: EstadoPedido = EstadoPedido.PENDIENTE;

  @IsArray({ message: 'El campo detalles debe ser un arreglo de productos.' })
  @ArrayMinSize(1, {
    message: 'Debe incluir al menos un producto en el pedido.',
  })
  @ValidateNested({ each: true })
  @Type(() => PedidoDetalleDto)
  detalles: PedidoDetalleDto[];
}
