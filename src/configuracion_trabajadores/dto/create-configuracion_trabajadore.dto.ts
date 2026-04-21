import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

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

  @IsOptional()
  @IsString({ message: 'El cargo debe ser texto válido' })
  cargo?: string;

  @IsNumber({}, { message: 'El salario diario debe ser un número válido' })
  @Min(0, { message: 'El salario diario no puede ser negativo' })
  salarioDiario: number;

  @IsOptional()
  @IsNumber(
    {},
    { message: 'El factor de hora extra diurna debe ser un número válido' },
  )
  @Min(0, { message: 'El factor de hora extra diurna no puede ser negativo' })
  factorHoraExtraDiurnas?: number;

  @IsOptional()
  @IsNumber(
    {},
    { message: 'El factor de hora extra nocturna debe ser un número válido' },
  )
  @Min(0, { message: 'El factor de hora extra nocturna no puede ser negativo' })
  factorHoraExtraNocturnas?: number;

  @IsOptional()
  @IsNumber(
    {},
    { message: 'El factor de hora extra nocturna debe ser un número válido' },
  )
  @Min(0, { message: 'El factor de hora extra nocturna no puede ser negativo' })
  factorHoraExtraFestivas?: number;

  @IsInt({ message: 'Las horas de jornada deben ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 hora de jornada semanal' })
  horasJornadaSemanal: number;

  @IsInt({ message: 'Los dias de jornada deben ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 dia de jornada semanal' })
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
