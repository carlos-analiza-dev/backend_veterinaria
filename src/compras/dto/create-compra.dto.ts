import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { TipoPago } from '../entities/compra.entity';
import { CreateCompraDetalleDto } from './create-compra-detalle.dto';

export class CreateCompraDto {
  @IsUUID()
  proveedorId: string;

  @IsUUID()
  sucursalId: string;

  @IsUUID()
  paisId: string;

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
  @Type(() => CreateCompraDetalleDto)
  detalles: CreateCompraDetalleDto[];
}
