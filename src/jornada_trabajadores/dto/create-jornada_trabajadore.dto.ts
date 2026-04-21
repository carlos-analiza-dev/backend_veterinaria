import {
  IsUUID,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateJornadaTrabajadoreDto {
  @IsUUID('4', { message: 'El ID del trabajador no es válido' })
  trabajadorId: string;

  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  fecha: Date;

  @IsBoolean({ message: 'El campo trabajo debe ser verdadero o falso' })
  trabajo: boolean;

  @IsOptional()
  @IsString({ message: 'La labor realizada debe ser texto' })
  laborRealizada?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Las horas extras diurnas deben ser un número' })
  @Min(0, { message: 'Las horas extras diurnas no pueden ser negativas' })
  @Max(24, { message: 'Las horas extras diurnas no pueden exceder 24 horas' })
  horasExtrasDiurnas?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Las horas extras nocturnas deben ser un número' })
  @Min(0, { message: 'Las horas extras nocturnas no pueden ser negativas' })
  @Max(24, { message: 'Las horas extras nocturnas no pueden exceder 24 horas' })
  horasExtrasNocturnas?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Las horas extras festivas deben ser un número' })
  @Min(0, { message: 'Las horas extras festivas no pueden ser negativas' })
  @Max(24, { message: 'Las horas extras festivas no pueden exceder 24 horas' })
  horasExtrasFestivas?: number;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;
}
