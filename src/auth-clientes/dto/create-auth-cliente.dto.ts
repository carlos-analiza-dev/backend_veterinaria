import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAuthClienteDto {
  @IsString()
  @MinLength(3, {
    message: 'El nombre debe tener un mínimo de 3 caracteres',
  })
  nombre: string;

  @IsString()
  @MinLength(5, {
    message: 'La identificación debe tener un mínimo de 5 caracteres',
  })
  identificacion: string;

  @IsString()
  @MinLength(3, {
    message: 'El teléfono debe tener un mínimo de 3 caracteres',
  })
  telefono: string;

  @IsString()
  @IsEmail()
  @Matches(
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    { message: 'El correo electronico no tiene formato adecuado' },
  )
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/, {
    message:
      'La contraseña debe tener al entre 8 y 16 caracteres, al menos un dígito, al menos una minúscula y al menos una mayúscula.',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(10, {
    message: 'La dirección debe tener un mínimo de 10 caracteres',
  })
  direccion?: string;

  @IsString()
  @IsNotEmpty({ message: 'El país es obligatorio' })
  pais: string;

  @IsString()
  @IsNotEmpty({ message: 'El departamento es obligatorio' })
  departamento: string;

  @IsString()
  @IsNotEmpty({ message: 'El municipio es obligatorio' })
  municipio: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
