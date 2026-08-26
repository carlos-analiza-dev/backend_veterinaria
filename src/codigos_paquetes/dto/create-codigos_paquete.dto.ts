import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateCodigosPaqueteDto {
  @IsString({
    message: 'El código del paquete debe ser una cadena de texto.',
  })
  @Length(1, 50, {
    message: 'El código del paquete debe tener entre 1 y 50 caracteres.',
  })
  codigo: string;

  @IsUUID('4', {
    message: 'El paquete seleccionado debe tener un ID UUID válido.',
  })
  paqueteId: string;

  @IsOptional()
  @IsBoolean({
    message: 'El campo activo debe ser verdadero o falso.',
  })
  activo?: boolean;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de expiración debe tener un formato de fecha válido.',
    },
  )
  fechaExpiracion?: string;
}
