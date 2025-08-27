import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateTaxesPaiDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100, { message: 'El nombre no debe exceder los 100 caracteres.' })
  nombre: string;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'El porcentaje debe ser un número válido.' },
  )
  @IsNotEmpty({ message: 'El porcentaje es obligatorio.' })
  @Min(0.01, { message: 'El porcentaje debe ser mayor que 0.' })
  @Max(0.99, { message: 'El porcentaje debe ser menor que 1.' })
  porcentaje: number;

  @IsUUID('4', { message: 'El país debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El país es obligatorio.' })
  paisId: string;
}
