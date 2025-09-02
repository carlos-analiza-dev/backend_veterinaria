import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateServicioDto {
  @IsString({ message: 'El nombre del servicio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del servicio es obligatorio' })
  @Length(3, 50, {
    message: 'El nombre del servicio debe tener entre 3 y 50 caracteres',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'El nombre solo debe contener letras y espacios',
  })
  nombre: string;

  @IsString({
    message: 'La descripción del servicio debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @Length(10, 250, {
    message: 'La descripción debe tener entre 10 y 250 caracteres',
  })
  descripcion: string;

  @IsOptional()
  @IsBoolean({
    message: 'El campo isActive debe ser un valor booleano (true o false)',
  })
  isActive?: boolean;

  @IsUUID('4', { message: 'El id del país debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El país es obligatorio' })
  paisId: string;
}
