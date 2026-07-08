import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class DescarteAnimalDto {
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

  @IsOptional()
  @IsString({
    message: 'La razón de descarte debe ser una cadena de texto.',
  })
  razon_descarte?: string;

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
}
