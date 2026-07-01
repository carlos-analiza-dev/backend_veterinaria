import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TipoAlimentacionDto } from './create-animal_finca.dto';

export class CreatePorcinoDto {
  @IsString({ message: 'El identificador debe ser un texto' })
  @IsNotEmpty({ message: 'El identificador del animal es obligatorio' })
  identificador: string;

  @IsString({ message: 'El nombre del animal debe ser un texto.' })
  nombre_animal: string;

  @IsUUID('4', { message: 'La finca seleccionada no es válida.' })
  fincaId: string;

  @IsString({ message: 'El sexo es obligatorio.' })
  sexo: string;

  @IsString({ message: 'El color debe ser un texto.' })
  color: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray({ message: 'Las razas deben ser un arreglo de IDs válidos' })
  @IsUUID('4', {
    each: true,
    message: 'Cada raza del animal debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'Debes ingresar al menos una raza' })
  razaIds: string[];

  @IsOptional()
  @IsString({ message: 'El tipo de registro porcino es obligatorio.' })
  tipo_registro_porcino?: string;

  @IsOptional()
  @IsString({ message: 'La etapa porcina es obligatoria.' })
  etapa_porcino?: string;

  @IsOptional()
  @IsString({ message: 'El corral/galera debe ser un texto.' })
  corral_galera?: string;

  @IsOptional()
  @IsString({ message: 'El nombre del lote debe ser un texto.' })
  lote?: string;

  @IsOptional()
  @IsString({ message: 'El proveedor debe ser un texto.' })
  proveedor?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de ingreso debe ser una fecha válida.' })
  fecha_ingreso_porcino?: Date;

  @IsOptional()
  @Type(() => Number)
  cantidad_inicial_porcino?: number;

  @IsOptional()
  @Type(() => Number)
  cantidad_actual_porcino?: number;

  @IsOptional()
  @Type(() => Number)
  peso_inicial_porcino?: number;

  @IsOptional()
  @IsString({ message: 'El peso promedio debe ser un texto' })
  peso_promedio?: string;

  @IsOptional()
  @Type(() => Number)
  ganancia_peso?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de pesaje debe ser una fecha válida.' })
  fecha_pesaje_porcino?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TipoAlimentacionDto)
  tipo_alimentacion?: TipoAlimentacionDto[];

  @IsOptional()
  @Type(() => Number)
  consumo_diario_porcino?: number;

  @IsOptional()
  @IsString({ message: 'Las vacunas deben ser un texto.' })
  vacunas?: string;

  @IsOptional()
  @IsString({ message: 'Los tratamientos deben ser un texto.' })
  tratamientos?: string;

  @IsOptional()
  @IsString({ message: 'La condición corporal es obligatoria.' })
  condicion_corporal?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({ message: 'El campo desparasitado debe ser verdadero o falso.' })
  desparasitado?: boolean;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({ message: 'El campo mortalidad debe ser verdadero o falso.' })
  mortalidad?: boolean;

  @IsOptional()
  @Type(() => Number)
  bajas_mortalidad_porcino?: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({ message: 'El campo cuarentena debe ser verdadero o falso.' })
  cuarentena_porcino?: boolean;

  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? undefined : value,
  )
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de salida debe tener formato YYYY-MM-DD' },
  )
  fecha_salida_porcino?: string;

  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsOptional()
  peso_salida_porcino?: number;

  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? undefined : value,
  )
  @IsOptional()
  @IsString({ message: 'El comprador debe ser un texto.' })
  comprador_porcino?: string;

  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsOptional()
  precio_porcino?: number;

  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsOptional()
  @IsNumber({}, { message: 'El rendimiento en canal debe ser un número.' })
  rendimiento_canal_porcino?: number;

  @IsOptional()
  @IsUUID('4', { message: 'El propietario seleccionado no es válido.' })
  propietarioId: string;

  @IsOptional()
  @IsString({ message: 'El nombre del criador debe ser un texto.' })
  nombre_criador_origen_animal?: string;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto.' })
  observaciones?: string;

  @IsString({ message: 'La especie es obligatoria.' })
  especie: string;
}
