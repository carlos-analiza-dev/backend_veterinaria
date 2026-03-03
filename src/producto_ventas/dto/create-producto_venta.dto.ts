import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UnidadMedida } from 'src/interfaces/unidad-medida';

export class CreateProductoVentaDto {
  @IsEnum(UnidadMedida, {
    message: 'Unidad de medida inválida',
  })
  unidadMedida: UnidadMedida;

  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  precio: number;

  @IsOptional()
  @IsString()
  moneda?: string;

  @IsUUID('4', { message: 'El producto debe ser válido' })
  productoId: string;
}
