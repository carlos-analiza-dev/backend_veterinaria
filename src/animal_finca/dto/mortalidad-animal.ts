import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMortalidadAnimalDto {
  @IsInt({
    message: 'La cantidad debe ser un número entero.',
  })
  @Min(1, {
    message: 'La cantidad debe ser mayor o igual a 1.',
  })
  cantidad: number;

  @IsString({
    message: 'La razón de la muerte debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'La razón de la muerte es obligatoria.',
  })
  @MaxLength(200, {
    message: 'La razón de la muerte no puede superar los 200 caracteres.',
  })
  razon_muerte: string;

  @IsDateString(
    {},
    {
      message:
        'La fecha de mortalidad debe tener un formato de fecha válido (YYYY-MM-DD).',
    },
  )
  fecha_mortalidad: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({
    message: 'El campo "muerto" debe ser un valor booleano (true o false).',
  })
  muerto?: boolean;
}
