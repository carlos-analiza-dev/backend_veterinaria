import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class UpdateCantidadDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @IsPositive()
  cantidadUsada: number;
}
