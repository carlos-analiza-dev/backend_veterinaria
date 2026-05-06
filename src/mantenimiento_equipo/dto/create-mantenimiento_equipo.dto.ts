import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TipoMantenimiento } from 'src/interfaces/maquinaria/maquinaria.enums';

export class CreateMantenimientoEquipoDto {
  @IsUUID('4', { message: 'El ID del equipo debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El equipo es obligatorio' })
  equipoId: string;

  @IsEnum(TipoMantenimiento, {
    message: `El tipo de mantenimiento debe ser uno de los siguientes: ${Object.values(TipoMantenimiento).join(', ')}`,
  })
  tipo: TipoMantenimiento;

  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción del mantenimiento es obligatoria' })
  descripcion: string;

  @IsDateString(
    {},
    {
      message: 'La fecha de inicio debe tener un formato válido (YYYY-MM-DD)',
    },
  )
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fecha_inicio: string;

  @IsDateString(
    {},
    {
      message: 'La fecha final debe tener un formato válido (YYYY-MM-DD)',
    },
  )
  @IsNotEmpty({ message: 'La fecha final es obligatoria' })
  fecha_final: string;

  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser un número válido' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  costo?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString(
    {},
    {
      message:
        'La fecha del próximo mantenimiento debe ser válida (YYYY-MM-DD)',
    },
  )
  proximoMantenimiento?: string;
}
