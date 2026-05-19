import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaquetePaiDto {
  @IsUUID('4', {
    message: 'El id del paquete debe ser un UUID válido',
  })
  @IsNotEmpty({
    message: 'El paquete es obligatorio',
  })
  paqueteId: string;

  @IsUUID('4', {
    message: 'El id del país debe ser un UUID válido',
  })
  @IsNotEmpty({
    message: 'El país es obligatorio',
  })
  paisId: string;

  @IsNumber(
    {},
    {
      message: 'El precio mensual debe ser un número',
    },
  )
  @Min(0, {
    message: 'El precio mensual no puede ser negativo',
  })
  precioMensual: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'El precio anual debe ser un número',
    },
  )
  @Min(0, {
    message: 'El precio anual no puede ser negativo',
  })
  precioAnual?: number;

  @IsOptional()
  @IsBoolean({
    message: 'El estado debe ser verdadero o falso',
  })
  isActive?: boolean;
}
