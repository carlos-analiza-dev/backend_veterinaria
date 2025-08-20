import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMarcaDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsString({ message: 'El país de origen debe ser un texto' })
  @IsNotEmpty({ message: 'El país de origen es obligatorio' })
  @MaxLength(100, {
    message: 'El país de origen no puede exceder 100 caracteres',
  })
  pais_origen: string;
}
