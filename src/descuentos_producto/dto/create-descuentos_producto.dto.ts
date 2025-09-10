import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateDescuentosProductoDto {
  @IsUUID('4', { message: 'El productoId debe ser un UUID válido' })
  productoId: string;

  @IsInt({ message: 'La cantidad comprada debe ser un número entero' })
  @Min(1, { message: 'La cantidad comprada debe ser mayor a 0' })
  cantidad_comprada: number;

  @IsNumber({}, { message: 'El descuento debe ser un número válido' })
  @Min(0, { message: 'El descuento no puede ser negativo' })
  descuentos: number;
}
