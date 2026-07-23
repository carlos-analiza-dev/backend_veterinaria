import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TipoPago } from '../entities/agro-compras-producto.entity';
import { Transform, Type } from 'class-transformer';
import { CreateAgroCompraDetalleDto } from './create-detallles-agro-compra.dto';

export class CreateAgroComprasProductoDto {
  @IsUUID()
  proveedorId: string;

  @IsUUID()
  sucursalId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numero_factura?: string;

  @IsEnum(TipoPago)
  tipo_pago: TipoPago;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  descuentos?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  impuestos?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  subtotal?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  total?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAgroCompraDetalleDto)
  detalles: CreateAgroCompraDetalleDto[];
}
