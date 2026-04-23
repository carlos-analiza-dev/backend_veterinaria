import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  IsArray,
  Matches,
} from 'class-validator';
import {
  DiaSemana,
  TipoTrabajador,
} from 'src/interfaces/config-trabajadores.enums';

class BonificacionDto {
  @IsString({ message: 'El concepto de la bonificación es obligatorio' })
  concepto: string;

  @IsNumber({}, { message: 'El monto mensual debe ser un número válido' })
  @Min(0, { message: 'El monto mensual no puede ser negativo' })
  montoMensual: number;
}

class DeduccionDto {
  @IsString({ message: 'El concepto de la deducción es obligatorio' })
  concepto: string;

  @IsNumber({}, { message: 'El monto mensual debe ser un número válido' })
  @Min(0, { message: 'El monto mensual no puede ser negativo' })
  montoMensual: number;
}

export class CreateConfiguracionTrabajadoreDto {
  @IsUUID('4', { message: 'El ID del trabajador debe ser un UUID válido' })
  trabajadorId: string;

  @IsDateString({}, { message: 'La fecha de contratación debe ser válida' })
  fechaContratacion: Date;

  @IsEnum(TipoTrabajador, {
    message: 'El tipo de trabajador no es válido',
  })
  tipoTrabajador: TipoTrabajador;

  @IsOptional()
  @IsEnum(DiaSemana, {
    message: 'El día de descanso no es válido',
  })
  diaDescanso?: DiaSemana;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de entrada debe tener formato HH:mm',
  })
  horaEntrada?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de salida debe tener formato HH:mm',
  })
  horaSalida?: string;

  @IsOptional()
  @IsArray({ message: 'Los días laborales deben ser un arreglo' })
  @IsEnum(DiaSemana, {
    each: true,
    message: 'Uno o más días laborales no son válidos',
  })
  diasLaborales?: DiaSemana[];

  @IsOptional()
  @IsString({ message: 'El cargo debe ser texto válido' })
  cargo?: string;

  @IsNumber({}, { message: 'El salario diario debe ser un número válido' })
  @Min(0, { message: 'El salario diario no puede ser negativo' })
  salarioDiario: number;

  @IsOptional()
  @IsNumber({}, { message: 'El factor de hora extra diurna debe ser válido' })
  @Min(0)
  factorHoraExtraDiurnas?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El factor de hora extra nocturna debe ser válido' })
  @Min(0)
  factorHoraExtraNocturnas?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El factor de hora extra festiva debe ser válido' })
  @Min(0)
  factorHoraExtraFestivas?: number;

  @IsInt({ message: 'Las horas de jornada deben ser un número entero' })
  @Min(1)
  horasJornadaSemanal: number;

  @IsInt({ message: 'Los días trabajados deben ser un número entero' })
  @Min(1)
  diasTrabajadosSemanal: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BonificacionDto)
  bonificacionesFijas?: BonificacionDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DeduccionDto)
  deduccionesFijas?: DeduccionDto[];

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  activo?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de baja debe ser válida' })
  fechaBaja?: Date;

  @IsOptional()
  @IsString({ message: 'El motivo de baja debe ser texto válido' })
  motivoBaja?: string;
}
