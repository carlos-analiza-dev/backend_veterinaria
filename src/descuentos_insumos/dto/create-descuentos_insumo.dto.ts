import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateDescuentosInsumoDto {
  @IsUUID('4', { message: 'El insumo no es válido' })
  insumoId: string;

  @IsUUID('4', { message: 'El proveedor no es válido' })
  proveedorId: string;

  @IsUUID('4', { message: 'El ID del pais debe ser un UUID válido' })
  paisId: string;

  @IsInt({ message: 'La cantidad comprada debe ser un número entero' })
  @Min(1, { message: 'La cantidad comprada debe ser mayor a 0' })
  cantidad_comprada: number;

  @IsNumber({}, { message: 'El descuento debe ser un número válido' })
  @Min(0, { message: 'El descuento no puede ser negativo' })
  descuentos: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
