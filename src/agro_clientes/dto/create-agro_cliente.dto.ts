import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAgroClienteDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(150, {
    message: 'El nombre no debe superar los 150 caracteres.',
  })
  nombre: string;

  @IsString({
    message: 'La identificación debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La identificación es obligatoria.' })
  @MaxLength(50, {
    message: 'La identificación no debe superar los 50 caracteres.',
  })
  identificacion: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
  @MaxLength(20, {
    message: 'El teléfono no debe superar los 20 caracteres.',
  })
  telefono: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @MaxLength(100, {
    message: 'El correo electrónico no debe superar los 100 caracteres.',
  })
  email?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  @MaxLength(255, {
    message: 'La dirección no debe superar los 255 caracteres.',
  })
  direccion?: string;

  @IsString({ message: 'El sexo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El sexo es obligatorio.' })
  @MaxLength(20, {
    message: 'El sexo no debe superar los 20 caracteres.',
  })
  sexo: string;

  @IsUUID('4', {
    message: 'El departamento seleccionado no es válido.',
  })
  @IsNotEmpty({ message: 'El departamento es obligatorio.' })
  departamentoId: string;

  @IsUUID('4', {
    message: 'El municipio seleccionado no es válido.',
  })
  @IsNotEmpty({ message: 'El municipio es obligatorio.' })
  municipioId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
