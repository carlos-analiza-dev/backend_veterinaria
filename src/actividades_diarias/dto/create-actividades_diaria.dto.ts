import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  EstadoActividad,
  FrecuenciaActividad,
  TipoActividad,
} from 'src/interfaces/actividades/actividaes.enums';

export class CreateActividadesDiariaDto {
  @IsUUID('4', { message: 'El ID del trabajador debe ser un UUID válido' })
  trabajadorId: string;

  @IsUUID('4', {
    message: 'El ID de la finca debe ser un UUID válido',
  })
  @IsOptional()
  fincaId?: string;

  @IsDateString(
    {},
    {
      message: 'La fecha debe tener un formato válido (YYYY-MM-DD)',
    },
  )
  fecha: string;

  @IsEnum(TipoActividad, {
    message:
      'El tipo de actividad no es válido (siembra, reparacion, limpieza, mantenimiento, otro)',
  })
  tipo: TipoActividad;

  @IsEnum(EstadoActividad, {
    message: 'El estado debe ser válido (pendiente, en_progreso, completada)',
  })
  @IsOptional()
  estado?: EstadoActividad;

  @IsEnum(FrecuenciaActividad, {
    message: 'La frecuencia debe ser válida (diaria o semanal)',
  })
  @IsOptional()
  frecuencia?: FrecuenciaActividad;

  @IsString({
    message: 'La descripción debe ser un texto válido',
  })
  @IsOptional()
  descripcion?: string;

  @IsBoolean({
    message: 'El campo completada debe ser verdadero o falso',
  })
  @IsOptional()
  completada?: boolean;
}
