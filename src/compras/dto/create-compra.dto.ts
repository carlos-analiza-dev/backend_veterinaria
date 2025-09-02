import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TipoPago } from '../entities/compra.entity';
import { CreateCompraDetalleDto } from './create-compra-detalle.dto';

export class CreateCompraDto {
  @IsUUID()
  proveedorId: string;

  @IsUUID()
  sucursalId: string;

  @IsEnum(TipoPago)
  tipo_pago: TipoPago;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : 0)
  descuentos?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : 0)
  impuestos?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompraDetalleDto)
  detalles: CreateCompraDetalleDto[];
}