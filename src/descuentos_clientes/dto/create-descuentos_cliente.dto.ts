import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDescuentosClienteDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100, { message: 'El nombre no debe exceder los 100 caracteres.' })
  nombre: string;

  @IsInt({ message: 'El porcentaje debe ser un número entero.' })
  @IsNotEmpty({ message: 'El porcentaje es obligatorio.' })
  @Min(1, { message: 'El porcentaje debe ser al menos 1.' })
  @Max(99, { message: 'El porcentaje debe ser como máximo 99.' })
  porcentaje: number;

  @IsUUID('4', { message: 'El país debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El país es obligatorio.' })
  paisId: string;
}
