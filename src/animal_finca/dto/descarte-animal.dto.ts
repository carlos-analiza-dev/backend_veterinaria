import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class DescarteAnimalDto {
  @IsInt({
    message: 'La cantidad debe ser un número entero.',
  })
  @Min(1, {
    message: 'La cantidad debe ser mayor a 0.',
  })
  cantidad: number;

  @IsString({
    message: 'La razón de descarte debe ser una cadena de texto.',
  })
  razon_descarte: string;

  @Transform(({ value }) => {
    if (!value || value === '' || value === 'undefined') {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de descarte debe tener el formato YYYY-MM-DD.',
    },
  )
  fecha_descarte?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({
    message: 'El campo "descartado" debe ser un valor booleano (true o false).',
  })
  descartado?: boolean;
}
