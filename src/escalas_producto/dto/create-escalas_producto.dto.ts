import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEscalasProductoDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productoId: string;

  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  proveedorId: string;

  @IsUUID('4', { message: 'El ID del pais debe ser un UUID válido' })
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
