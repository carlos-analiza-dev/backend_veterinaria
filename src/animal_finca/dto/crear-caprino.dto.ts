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
  ValidateNested,
} from 'class-validator';
import { TipoAlimentacionDto } from './create-animal_finca.dto';
import { PurezaEnum } from 'src/interfaces/animales/animales-enums';

export class CreateCaprinoDto {
  @IsString({ message: 'El identificador debe ser un texto' })
  @IsNotEmpty({ message: 'El identificador del animal es obligatorio' })
  identificador: string;

  @IsString({ message: 'El nombre del animal debe ser un texto.' })
  nombre_animal: string;

  @IsUUID('4', { message: 'La finca seleccionada no es válida.' })
  fincaId: string;

  @IsOptional()
  @IsUUID('4', { message: 'El padre debe ser un UUID válido' })
  padreId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'La madre debe ser un UUID válido' })
  madreId?: string;

  @IsOptional()
  @IsString({ message: 'El potrero debe ser un texto.' })
  potrero?: string;

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

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    }

    if (typeof value === 'number') {
      return value;
    }
    return 0;
  })
  @IsNumber({}, { message: 'La edad promedio debe ser un número' })
  @Min(0, { message: 'La edad promedio debe ser mayor o igual a 0' })
  edad_promedio: number;

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

  @IsString({ message: 'El sexo es obligatorio.' })
  sexo: string;

  @IsString({ message: 'El color debe ser un texto.' })
  color: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El peso debe ser un número.' })
  peso: number;

  @IsString({ message: 'La condición corporal es obligatoria.' })
  condicion_corporal: string;

  @IsString({ message: 'El propósito es obligatorio.' })
  proposito: string;

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
  @IsArray({ message: 'Las razas deben ser un arreglo de IDs válidos' })
  @IsUUID('4', {
    each: true,
    message: 'Cada raza de la madre debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'Debes ingresar al menos una raza al padre' })
  razas_padre: string[];

  @IsOptional()
  @IsEnum(PurezaEnum, {
    message:
      'La pureza del padre debe ser uno de: Puro, Puro por cruza, 3/4 raza, 1/2 raza, Criollo',
  })
  pureza_padre: PurezaEnum;

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
  @IsArray({ message: 'Las razas deben ser un arreglo de IDs válidos' })
  @IsUUID('4', {
    each: true,
    message: 'Cada raza de la madre debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'Debes ingresar al menos una raza a la madre' })
  razas_madre: string[];

  @IsOptional()
  @IsEnum(PurezaEnum, {
    message:
      'La pureza de la madre debe ser uno de: Puro, Puro por cruza, 3/4 raza, 1/2 raza, Criollo',
  })
  pureza_madre: PurezaEnum;

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
  @IsString({ message: 'El nombre del criador debe ser un texto.' })
  nombre_criador_origen_animal?: string;

  @IsOptional()
  @IsString({ message: 'La línea genética debe ser un texto.' })
  linea_genetica?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'Los litros de leche por día deben ser un número.',
    },
  )
  litros_leche_dia?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El peso al destete debe ser un número.',
    },
  )
  peso_destete?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'La ganancia de peso debe ser un número.',
    },
  )
  ganancia_peso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'La grasa de la leche debe ser un número.',
    },
  )
  calidad_leche_grasa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'La proteína de la leche debe ser un número.',
    },
  )
  calidad_leche_proteina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El conteo de células de la leche debe ser un número.',
    },
  )
  calidad_leche_celulas?: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({
    message: 'El valor de desparasitado debe ser verdadero o falso.',
  })
  desparasitado?: boolean;

  @IsOptional()
  vacunas?: string;

  @IsOptional()
  @IsString({ message: 'La información de mastitis debe ser un texto.' })
  mastitis?: string;

  @IsOptional()
  @IsString({ message: 'La información de las pezuñas debe ser un texto.' })
  pezunas?: string;

  @IsOptional()
  @IsString({ message: 'Los tratamientos deben ser un texto.' })
  tratamientos?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({
    message: 'El campo mortalidad debe ser verdadero o falso.',
  })
  mortalidad?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TipoAlimentacionDto)
  tipo_alimentacion: TipoAlimentacionDto[];

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto.' })
  observaciones?: string;

  @IsUUID('4', {
    message: 'El propietario seleccionado no es válido.',
  })
  propietarioId: string;

  @IsString({
    message: 'La especie es obligatoria.',
  })
  especie: string;
}
