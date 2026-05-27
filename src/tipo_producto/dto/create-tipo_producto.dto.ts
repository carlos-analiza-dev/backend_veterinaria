import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateTipoProductoDto {
  @IsString({
    message: 'El nombre del tipo de producto debe ser un texto válido',
  })
  @Length(2, 100, {
    message:
      'El nombre del tipo de producto debe tener entre 2 y 100 caracteres',
  })
  nombre: string;

  @IsOptional()
  @IsString({
    message: 'La descripción debe ser un texto válido',
  })
  @Length(5, 1000, {
    message: 'La descripción debe tener entre 5 y 1000 caracteres',
  })
  descripcion?: string;

  @IsUUID('4', {
    message: 'La subcategoría seleccionada no es válida',
  })
  subcategoriaId: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({
    message: 'El estado activo debe ser verdadero o falso',
  })
  is_active?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El valor de is_market debe ser verdadero o falso' })
  is_market?: boolean;
}
