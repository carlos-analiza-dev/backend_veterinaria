import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class UpdateCantidadDto {
  @IsUUID()
  insumoId: string;

  @IsInt()
  @IsPositive()
  cantidadUsada: number;
}
