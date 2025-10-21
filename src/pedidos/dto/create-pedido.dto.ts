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
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPedido, TipoEntrega } from '../entities/pedido.entity';

export class PedidoDetalleDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido.' })
  id_producto: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número válido.' })
  @IsPositive({ message: 'La cantidad debe ser mayor que cero.' })
  cantidad: number;

  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @IsPositive({ message: 'El precio debe ser mayor que cero.' })
  @Min(0.01, { message: 'El precio mínimo permitido es 0.01.' })
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
    message: `El estado del pedido debe ser uno de los siguientes: ${Object.values(
      EstadoPedido,
    ).join(', ')}.`,
  })
  @IsOptional()
  estado?: EstadoPedido = EstadoPedido.PENDIENTE;

  @IsString({ message: 'La dirección de entrega debe ser un texto válido.' })
  @MaxLength(255, {
    message: 'La dirección de entrega no puede exceder los 255 caracteres.',
  })
  @IsOptional()
  direccion_entrega?: string;

  @IsNumber()
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @IsOptional()
  longitud?: number;

  @IsEnum(TipoEntrega, {
    message: `El tipo de entrega debe ser uno de los siguientes: ${Object.values(
      TipoEntrega,
    ).join(', ')}.`,
  })
  @IsOptional()
  tipo_entrega?: TipoEntrega = TipoEntrega.RECOGER;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'El costo de delivery debe ser un número válido con hasta 2 decimales.',
    },
  )
  @Min(0, { message: 'El costo de delivery no puede ser negativo.' })
  @IsOptional()
  costo_delivery?: number;

  @IsString({ message: 'El nombre de la finca debe ser un texto válido.' })
  @MaxLength(100, {
    message: 'El nombre de la finca no puede exceder los 100 caracteres.',
  })
  @IsOptional()
  nombre_finca?: string;

  @IsArray({ message: 'El campo detalles debe ser un arreglo de productos.' })
  @ArrayMinSize(1, {
    message: 'Debe incluir al menos un producto en el pedido.',
  })
  @ValidateNested({ each: true })
  @Type(() => PedidoDetalleDto)
  detalles: PedidoDetalleDto[];
}
