import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateUsoEquipoDto {
  @IsUUID('4', { message: 'El ID del equipo debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El equipo es obligatorio' })
  equipoId: string;

  @ValidateIf((o) => o.actividadId && o.actividadId !== '')
  @IsUUID('4', { message: 'El ID de la actividad debe ser un UUID válido' })
  @IsOptional()
  actividadId?: string | null;

  @ValidateIf((o) => o.operadorId && o.operadorId !== '')
  @IsUUID('4', { message: 'El ID del operador debe ser un UUID válido' })
  @IsOptional()
  operadorId?: string | null;

  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fechaInicio: Date;

  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  fechaFin: Date;

  @IsNumber({}, { message: 'Las horas trabajadas deben ser un número' })
  @Min(0, { message: 'Las horas trabajadas no pueden ser negativas' })
  @Type(() => Number)
  horasTrabajadas: number;
}
