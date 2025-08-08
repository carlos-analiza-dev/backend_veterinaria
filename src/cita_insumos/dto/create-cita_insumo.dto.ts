import { IsInt, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateCitaInsumoDto {
  @IsUUID()
  citaId: string;

  @IsUUID()
  insumoId: string;

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  precioUnitario: number;
}
