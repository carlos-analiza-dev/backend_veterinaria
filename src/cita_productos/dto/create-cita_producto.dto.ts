import { IsInt, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateCitaProductoDto {
  @IsUUID()
  citaId: string;

  @IsUUID()
  productoId: string;

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  precioUnitario: number;
}
