import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { UnidadMedida } from 'src/interfaces/unidad-medida';

export class CreateInventarioProductosGanaderiaDto {
  @IsUUID()
  productoId: string;

  @IsUUID()
  fincaId: string;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsEnum(UnidadMedida)
  unidadMedida: UnidadMedida;

  @IsNumber()
  @Min(0)
  stockMinimo: number;
}
