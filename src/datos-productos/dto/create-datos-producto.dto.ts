import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDatosProductoDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  sub_servicioId: string;

  @IsUUID('4', { message: 'El ID de la sucursal debe ser un UUID válido' })
  sucursalId: string;

  @IsOptional()
  @IsNumber({}, { message: 'El punto de reorden debe ser un número válido' })
  @Min(0, { message: 'El punto de reorden no puede ser negativo' })
  @Transform(({ value }) => parseInt(value))
  punto_reorden?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Transform(({ value }) => parseFloat(value))
  precio: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El descuento debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El descuento no puede ser negativo' })
  @Transform(({ value }) => parseFloat(value))
  descuento?: number;
}