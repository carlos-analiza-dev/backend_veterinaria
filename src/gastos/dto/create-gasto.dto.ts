import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CategoriaGasto, MetodoPago } from 'src/interfaces/gastos.enums';

export class CreateGastoDto {
  @IsEnum(CategoriaGasto, {
    message: 'La categoría del gasto no es válida.',
  })
  categoria: CategoriaGasto;

  @IsOptional()
  @IsUUID('4', {
    message: 'La finca seleccionada no es válida.',
  })
  fincaId?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'La especie seleccionada no es válida.',
  })
  especieId?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'La raza seleccionada no es válida.',
  })
  razaId?: string;

  @IsString({
    message: 'El concepto debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El concepto del gasto es obligatorio.',
  })
  @MaxLength(200, {
    message: 'El concepto no puede superar los 200 caracteres.',
  })
  concepto: string;

  @IsOptional()
  @IsString({
    message: 'La descripción debe ser un texto válido.',
  })
  descripcion?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'El monto debe ser un número válido con máximo 2 decimales.',
    },
  )
  @IsNotEmpty({
    message: 'El monto del gasto es obligatorio.',
  })
  monto: number;

  @IsDateString(
    {},
    {
      message: 'La fecha del gasto debe ser una fecha válida.',
    },
  )
  fecha_gasto: Date;

  @IsOptional()
  @IsEnum(MetodoPago, {
    message: 'El método de pago seleccionado no es válido.',
  })
  metodo_pago?: MetodoPago;

  @IsOptional()
  @IsString({
    message: 'Las notas deben ser texto válido.',
  })
  notas?: string;
}
