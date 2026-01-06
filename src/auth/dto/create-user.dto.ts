import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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

  @IsString()
  @MinLength(3, {
    message: 'El nombre debe tener un minimo de 3 caracteres',
  })
  name: string;

  @IsString()
  @MinLength(5, {
    message: 'La identificacion debe tener un minimo de 5 caracteres',
  })
  identificacion: string;

  @IsString()
  @MinLength(10, {
    message: 'La direccion debe tener un minimo de 10 caracteres',
  })
  direccion: string;

  @IsString()
  @MinLength(3, {
    message: 'El telefono debe tener un minimo de 3 caracteres',
  })
  telefono: string;

  @IsString()
  @IsNotEmpty({ message: 'El pais es obligatorio' })
  pais: string;

  @IsString()
  @IsNotEmpty({ message: 'El departamento es obligatorio' })
  departamento: string;

  @IsString()
  @IsNotEmpty({ message: 'La sucursal es obligatoria' })
  sucursal: string;

  @IsString()
  @IsNotEmpty({ message: 'El sexo es obligatorio' })
  sexo: string;

  @IsString()
  @IsNotEmpty({ message: 'El municipio es obligatorio' })
  municipio: string;

  @IsOptional()
  @IsUUID()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isAuthorized?: boolean;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
