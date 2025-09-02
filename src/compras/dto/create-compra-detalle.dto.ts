import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateCompraDetalleDto {
  @IsUUID()
  productoId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  costo_por_unidad: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Transform(({ value }) => parseFloat(value))
  cantidad: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Transform(({ value }) => value ? parseFloat(value) : 0)
  bonificacion?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : 0)
  descuentos?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : 0)
  impuestos?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Transform(({ value }) => value ? parseFloat(value) : 0)
  cantidad_total?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : 0)
  monto_total?: number;

}