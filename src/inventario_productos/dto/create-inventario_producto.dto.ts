import { IsInt, IsUUID } from 'class-validator';

export class CreateInventarioProductoDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  cantidadDisponible: number;

  @IsInt()
  stockMinimo: number;
}
