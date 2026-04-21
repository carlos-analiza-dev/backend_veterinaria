import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EstadoPlanilla,
  TipoPeriodoPago,
} from 'src/interfaces/planillas.enums';
import { CreateDetallePlanillaTrabajadoreDto } from 'src/detalle_planilla_trabajadores/dto/create-detalle_planilla_trabajadore.dto';

export class CrearPlanillaTrabajadoresDto {
  @IsString({ message: 'El nombre de la planilla debe ser texto' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;

  @IsEnum(TipoPeriodoPago, {
    message: 'El tipo de período no es válido (QUINCENAL, MENSUAL)',
  })
  tipoPeriodo: TipoPeriodoPago;

  @IsInt({ message: 'Los días del período deben ser un número entero' })
  @Min(1, { message: 'El período debe tener al menos 1 día' })
  diasPeriodo: number;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fechaInicio: Date;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin: Date;

  @IsDateString({}, { message: 'La fecha de pago debe ser una fecha válida' })
  fechaPago: Date;

  @IsOptional()
  @IsEnum(EstadoPlanilla, {
    message: 'El estado de la planilla no es válido',
  })
  estado?: EstadoPlanilla;

  @IsOptional()
  @IsNumber({}, { message: 'El total de salarios debe ser un número' })
  @Min(0, { message: 'El total de salarios no puede ser negativo' })
  totalSalarios?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El total de horas extras debe ser un número' })
  @Min(0, { message: 'El total de horas extras no puede ser negativo' })
  totalHorasExtras?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El total de bonificaciones debe ser un número' })
  @Min(0, { message: 'El total de bonificaciones no puede ser negativo' })
  totalBonificaciones?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El total de deducciones debe ser un número' })
  @Min(0, { message: 'El total de deducciones no puede ser negativo' })
  totalDeducciones?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El total neto debe ser un número' })
  totalNeto?: number;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;

  /*  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetallePlanillaTrabajadoreDto)
  detalles: CreateDetallePlanillaTrabajadoreDto[]; */
}
