import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateEscalasInsumoDto {
  @IsUUID('4', { message: 'El producto no es válido' })
  insumoId: string;

  @IsUUID('4', { message: 'El proveedor no es válido' })
  proveedorId: string;

  @IsUUID('4', { message: 'El pais no es válido' })
  paisId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'La cantidad de compra debe ser mayor a 0' })
  cantidad_comprada: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(0, { message: 'La bonificación no puede ser negativa' })
  bonificacion?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El costo no puede ser negativo' })
  costo: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
