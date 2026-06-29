// create-ovino.dto.ts
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { TipoAlimentacionDto } from './create-animal_finca.dto';
import { PurezaEnum } from 'src/interfaces/animales/animales-enums';

export class LanaDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de esquila debe tener formato YYYY-MM-DD' },
  )
  fecha_esquila?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La calidad en micras debe ser un número' })
  calidad_micras?: number;

  @IsOptional()
  @IsString({ message: 'El color de la lana debe ser un texto' })
  color_lana?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El peso del vellón debe ser un número' })
  peso_vellon?: number;
}

export class HistorialEsquilaDto {
  @IsDateString(
    {},
    { message: 'La fecha de esquila debe tener formato YYYY-MM-DD' },
  )
  fecha_esquila: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El peso del vellón en kg debe ser un número' })
  peso_vellon_kg?: number;

  @IsOptional()
  @IsString({ message: 'La calidad/clasificación debe ser un texto' })
  calidad_clasificacion?: string;

  @IsOptional()
  @IsString({ message: 'El esquilador responsable debe ser un texto' })
  esquilador_responsable?: string;

  @IsOptional()
  observaciones?: string;
}

export class ParasitosDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El FAMACHA debe ser un número' })
  @Min(1, { message: 'El FAMACHA debe ser entre 1 y 5' })
  @Max(5, { message: 'El FAMACHA debe ser entre 1 y 5' })
  famacha?: number;

  @IsOptional()
  @IsString({ message: 'El tratamiento debe ser un texto' })
  tratamiento?: string;

  @Transform(({ value }) => {
    if (!value || value === '' || value === 'undefined') {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' },
  )
  fecha_tratamiento?: string;

  @IsOptional()
  observaciones?: string;
}

export class CreateOvinoDto {
  @IsString({ message: 'El identificador debe ser un texto' })
  @IsNotEmpty({ message: 'El identificador del animal es obligatorio' })
  identificador: string;

  @IsString({ message: 'El nombre del animal debe ser un texto.' })
  @IsOptional()
  nombre_animal?: string;

  @IsUUID('4', { message: 'La finca seleccionada no es válida.' })
  fincaId: string;

  @IsUUID('4', { message: 'La especie seleccionada no es válida.' })
  especie: string;

  @IsUUID('4', { message: 'El propietario seleccionado no es válido.' })
  propietarioId: string;

  @IsOptional()
  @IsUUID('4', { message: 'El padre debe ser un UUID válido' })
  padreId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'La madre debe ser un UUID válido' })
  madreId?: string;

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

  @IsString({ message: 'El sexo es obligatorio.' })
  sexo: string;

  @IsString({ message: 'El color debe ser un texto.' })
  color: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El peso debe ser un número.' })
  peso: number;

  @IsString({ message: 'La condición corporal es obligatoria.' })
  condicion_corporal: string;

  @Transform(({ value }) => {
    if (!value || value === '' || value === 'undefined') {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' },
  )
  fecha_nacimiento?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La edad promedio debe ser un número' })
  @Min(0, { message: 'La edad promedio debe ser mayor o igual a 0' })
  edad_promedio?: number;

  @IsOptional()
  @IsString({ message: 'El nombre del criador debe ser un texto.' })
  nombre_criador_origen_animal?: string;

  @IsOptional()
  observaciones?: string;

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
  @IsString({ message: 'El potrero debe ser un texto.' })
  potrero?: string;

  @IsOptional()
  @IsString({ message: 'La información de las pezuñas debe ser un texto.' })
  pezunas?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'La ganancia de peso debe ser un número.',
    },
  )
  ganancia_peso?: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({
    message: 'El campo mortalidad debe ser verdadero o falso.',
  })
  mortalidad?: boolean;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({
    message: 'El valor de desparasitado debe ser verdadero o falso.',
  })
  desparasitado?: boolean;

  @IsOptional()
  vacunas?: string;

  @IsOptional()
  tratamientos?: string;

  @IsOptional()
  @IsString({ message: 'La categoría de edad debe ser un texto.' })
  categoria_edad?: string;

  @IsString({ message: 'El propósito es obligatorio.' })
  proposito: string;

  @IsOptional()
  @IsString({ message: 'El tipo de nacimiento debe ser un texto.' })
  tipo_nacimiento?: string;

  @IsOptional()
  @IsString({ message: 'El nombre del padre debe ser un texto.' })
  nombre_padre?: string;

  @IsOptional()
  @IsString({ message: 'El arete del padre debe ser un texto.' })
  arete_padre?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray({
    message: 'Las razas del padre deben ser un arreglo de IDs válidos',
  })
  @IsUUID('4', {
    each: true,
    message: 'Cada raza del padre debe ser un UUID válido',
  })
  razas_padre?: string[];

  @IsOptional()
  @IsEnum(PurezaEnum, {
    message:
      'La pureza del padre debe ser uno de: Puro, Puro por cruza, 3/4 raza, 1/2 raza, Criollo',
  })
  pureza_padre?: PurezaEnum;

  @IsOptional()
  @IsString({ message: 'El nombre del criador del padre debe ser un texto.' })
  nombre_criador_padre?: string;

  @IsOptional()
  @IsString({
    message: 'El nombre del propietario del padre debe ser un texto.',
  })
  nombre_propietario_padre?: string;

  @IsOptional()
  @IsString({
    message: 'El nombre de la finca de origen del padre debe ser un texto.',
  })
  nombre_finca_origen_padre?: string;

  @IsOptional()
  @IsString({ message: 'El nombre de la madre debe ser un texto.' })
  nombre_madre?: string;

  @IsOptional()
  @IsString({ message: 'El arete de la madre debe ser un texto.' })
  arete_madre?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray({
    message: 'Las razas de la madre deben ser un arreglo de IDs válidos',
  })
  @IsUUID('4', {
    each: true,
    message: 'Cada raza de la madre debe ser un UUID válido',
  })
  razas_madre?: string[];

  @IsOptional()
  @IsEnum(PurezaEnum, {
    message:
      'La pureza de la madre debe ser uno de: Puro, Puro por cruza, 3/4 raza, 1/2 raza, Criollo',
  })
  pureza_madre?: PurezaEnum;

  @IsOptional()
  @IsString({ message: 'El nombre del criador de la madre debe ser un texto.' })
  nombre_criador_madre?: string;

  @IsOptional()
  @IsString({
    message: 'El nombre del propietario de la madre debe ser un texto.',
  })
  nombre_propietario_madre?: string;

  @IsOptional()
  @IsString({
    message: 'El nombre de la finca de origen de la madre debe ser un texto.',
  })
  nombre_finca_origen_madre?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El número de parto de la madre debe ser un número.',
    },
  )
  numero_parto_madre?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El peso al nacimiento debe ser un número.' })
  peso_nacimiento?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El peso al destete debe ser un número.' })
  peso_destete?: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value;
    }
    return {};
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LanaDto)
  lana?: LanaDto;

  @IsOptional()
  @IsArray({ message: 'El historial de esquila debe ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => HistorialEsquilaDto)
  historial_esquila?: HistorialEsquilaDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El FAMACHA debe ser un número' })
  @Min(1, { message: 'El FAMACHA debe ser entre 1 y 5' })
  @Max(5, { message: 'El FAMACHA debe ser entre 1 y 5' })
  famacha?: number;

  @IsOptional()
  @IsArray({ message: 'Los parásitos deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => ParasitosDto)
  parasitos?: ParasitosDto[];
}
