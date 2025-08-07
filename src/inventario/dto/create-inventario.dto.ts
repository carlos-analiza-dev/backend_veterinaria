import { IsInt, IsUUID } from 'class-validator';

export class CreateInventarioDto {
  @IsUUID()
  insumoId: string;

  @IsInt()
  cantidadDisponible: number;

  @IsInt()
  stockMinimo: number;
}
