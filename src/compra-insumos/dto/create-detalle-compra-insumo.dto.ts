import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateDetalleCompraInsumoDto {
  @IsUUID()
  insumoId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  costo_por_unidad: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Transform(({ value }) => parseFloat(value))
  cantidad: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  bonificacion?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  descuentos?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) =>
    value !== undefined ? parseFloat(value) : undefined,
  )
  porcentaje_impuesto?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  impuestos: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Transform(({ value }) => parseFloat(value))
  cantidad_total: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  monto_total: number;
}
