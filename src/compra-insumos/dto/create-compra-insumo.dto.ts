import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TipoPago } from '../entities/compra-insumo.entity';
import { CreateDetalleCompraInsumoDto } from './create-detalle-compra-insumo.dto';

export class CreateCompraInsumoDto {
  @IsUUID()
  proveedorId: string;

  @IsUUID()
  sucursalId: string;

  @IsUUID()
  paisId: string;

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
  @Type(() => CreateDetalleCompraInsumoDto)
  detalles: CreateDetalleCompraInsumoDto[];
}
