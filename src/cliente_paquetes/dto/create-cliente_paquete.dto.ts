import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateClientePaqueteDto {
  @IsUUID('4', {
    message: 'El id del paquete debe ser un UUID válido',
  })
  @IsNotEmpty({
    message: 'El paquete es obligatorio',
  })
  paqueteId: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de inicio debe ser una fecha válida',
    },
  )
  fechaInicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha fin debe ser una fecha válida',
    },
  )
  fechaFin?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser verdadero o falso',
  })
  activo?: boolean;
}
