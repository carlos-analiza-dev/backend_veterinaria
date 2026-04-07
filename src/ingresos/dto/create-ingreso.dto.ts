import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  IsPositive,
  MaxLength,
  Min,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from 'src/interfaces/gastos.enums';
import { CategoriaIngreso } from 'src/interfaces/ingresos.enums';

export class CreateIngresoDto {
  @IsEnum(CategoriaIngreso, {
    message: 'La categoría debe ser un valor válido de CategoriaIngreso',
  })
  categoria: CategoriaIngreso;

  @IsNotEmpty({ message: 'El ingreso de una finca es obligatorios' })
  @IsUUID(undefined, { message: 'El ID de la finca debe ser un UUID válido' })
  fincaId: string;
  @IsOptional()
  @IsUUID(undefined, { message: 'El ID de la especie debe ser un UUID válido' })
  especieId?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'El ID de la raza debe ser un UUID válido' })
  razaId?: string;

  @IsString({ message: 'El concepto debe ser un texto' })
  @MaxLength(200, {
    message: 'El concepto no puede exceder los 200 caracteres',
  })
  concepto: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsNumber({}, { message: 'El monto debe ser un número' })
  @IsPositive({ message: 'El monto debe ser un valor positivo' })
  @Min(0.01, { message: 'El monto mínimo es 0.01' })
  @Type(() => Number)
  monto: number;

  @IsDateString(
    {},
    {
      message: 'La fecha del ingreso debe ser una fecha válida.',
    },
  )
  fecha_ingreso: Date;

  @IsOptional()
  @IsEnum(MetodoPago, {
    message: 'El método de pago debe ser un valor válido de MetodoPago',
  })
  metodo_pago?: MetodoPago;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  notas?: string;
}
