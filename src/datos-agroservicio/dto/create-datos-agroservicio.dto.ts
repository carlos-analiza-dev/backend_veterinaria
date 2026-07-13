import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateDatosAgroservicioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del agroservicio es obligatorio' })
  nombre_agroservicio: string;

  @IsString()
  @IsNotEmpty({
    message: 'El identificafor o RTN del agroservicio es obligatorio',
  })
  rtn: string;

  @IsEmail()
  correo: string;

  @IsString()
  telefono: string;

  @IsString()
  direccion: string;
}
