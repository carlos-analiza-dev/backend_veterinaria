import {
  IsString,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export class CreateDatosEmpresaDto {
  @IsString()
  @IsNotEmpty()
  nombre_empresa: string;

  @IsString()
  @IsNotEmpty()
  rtn: string;

  @IsString()
  @IsNotEmpty()
  propietario: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;
}