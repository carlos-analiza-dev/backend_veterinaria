import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { TipoPaquete } from 'src/interfaces/paquetes/paquetes.enum';

export class CreatePaqueteDto {
  @IsString({
    message: 'El nombre del paquete debe ser un texto válido',
  })
  @IsNotEmpty({
    message: 'El nombre del paquete es obligatorio',
  })
  nombre: string;

  @IsEnum(TipoPaquete, {
    message: 'El tipo de paquete no es válido',
  })
  tipo: TipoPaquete;

  @IsInt({
    message: 'El máximo de fincas debe ser un número entero',
  })
  @Min(1, {
    message: 'El paquete debe permitir al menos 1 finca',
  })
  @Max(999999, {
    message: 'El máximo de fincas excede el límite permitido',
  })
  maxFincas: number;

  @IsInt({
    message: 'El máximo de animales debe ser un número entero',
  })
  @Min(1, {
    message: 'El paquete debe permitir al menos 1 animal',
  })
  @Max(999999, {
    message: 'El máximo de animales excede el límite permitido',
  })
  maxAnimales: number;

  @IsInt({
    message: 'El máximo de trabajadores debe ser un número entero',
  })
  @Min(0, {
    message: 'El máximo de trabajadores no puede ser negativo',
  })
  @Max(999999, {
    message: 'El máximo de trabajadores excede el límite permitido',
  })
  maxTrabajadores: number;

  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser verdadero o falso',
  })
  isActive?: boolean;
}
