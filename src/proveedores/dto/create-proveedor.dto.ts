import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProveedorDto {
  @IsString({ message: 'El NIT/RTN debe ser un texto' })
  @IsNotEmpty({ message: 'El NIT/RTN es obligatorio' })
  @MaxLength(20, { message: 'El NIT/RTN no puede exceder 20 caracteres' })
  nit_rtn: string;

  @IsOptional()
  @IsString({ message: 'El NRC debe ser un texto' })
  @MaxLength(20, { message: 'El NRC no puede exceder 20 caracteres' })
  nrc?: string;

  @IsString({ message: 'El nombre legal debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre legal es obligatorio' })
  @MaxLength(200, {
    message: 'El nombre legal no puede exceder 200 caracteres',
  })
  nombre_legal: string;

  @IsString({ message: 'El complemento de dirección debe ser un texto' })
  @IsNotEmpty({ message: 'El complemento de dirección es obligatorio' })
  complemento_direccion: string;

  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Matches(/^[0-9+\-\s]+$/, {
    message: 'El teléfono debe contener solo números, espacios, + o -',
  })
  @MinLength(8, { message: 'El teléfono debe tener al menos 8 caracteres' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono: string;

  @IsEmail({}, { message: 'El correo debe ser válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo?: string;

  @IsString({ message: 'El nombre del contacto debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del contacto es obligatorio' })
  @MaxLength(150, {
    message: 'El nombre del contacto no puede exceder 150 caracteres',
  })
  nombre_contacto: string;

  @IsOptional()
  @IsInt({ message: 'El plazo debe ser un número entero' })
  @IsPositive({ message: 'El plazo debe ser un número positivo' })
  plazo?: number;

  @IsEnum(['ESCALA', 'DESCUENTO'], {
    message: 'El tipo de escala debe ser ESCALA o DESCUENTO',
  })
  tipo_escala?: 'ESCALA' | 'DESCUENTO';

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  is_active?: boolean;

  @IsEnum(['CONTADO', 'CREDITO'], {
    message: 'El tipo de pago debe ser CONTADO o CREDITO',
  })
  tipo_pago_default?: 'CONTADO' | 'CREDITO';

  @IsUUID('4', { message: 'El ID del país debe ser un UUID válido' })
  paisId?: string;

  @IsUUID('4', { message: 'El ID del departamento debe ser un UUID válido' })
  departamentoId?: string;

  @IsUUID('4', { message: 'El ID del municipio debe ser un UUID válido' })
  municipioId?: string;
}
