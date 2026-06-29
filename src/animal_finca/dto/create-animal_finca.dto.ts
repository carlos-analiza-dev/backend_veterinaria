import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  PurezaEnum,
  TipoReproduccionEnum,
  UsoEquinoEnum,
} from 'src/interfaces/animales/animales-enums';

export class TipoAlimentacionDto {
  @IsString({ message: 'El nombre del alimento debe ser un texto válido.' })
  alimento: string;

  @IsIn(['comprado', 'producido', 'comprado y producido'], {
    message:
      'El origen debe ser "comprado", "producido" o "comprado y producido".',
  })
  origen: 'comprado' | 'producido' | 'comprado y producido';

  @ValidateIf((o) => o.origen === 'comprado y producido')
  porcentaje_comprado?: number;

  @ValidateIf((o) => o.origen === 'comprado y producido')
  porcentaje_producido?: number;
}

class ComplementoDto {
  @IsString({ message: 'El complemento debe ser un texto válido.' })
  complemento: string;
}

export class CreateAnimalFincaDto {
  @IsUUID('4', { message: 'La especie debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La especie del animal es obligatoria' })
  especie: string;

  @IsString({ message: 'El sexo debe ser un texto' })
  @IsNotEmpty({ message: 'El sexo del animal es obligatorio' })
  sexo: string;

  @IsString({ message: 'El color debe ser un texto' })
  @IsOptional()
  color: string;

  @IsString({ message: 'El color debe ser un texto' })
  @IsOptional()
  nombre_animal: string;

  @IsString({ message: 'La produccion debe ser un texto' })
  @IsOptional()
  produccion: string;

  @IsString({ message: 'El tipo de produccion debe ser un texto' })
  @IsOptional()
  tipo_produccion: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TipoAlimentacionDto)
  tipo_alimentacion: TipoAlimentacionDto[];

  @IsEnum(TipoReproduccionEnum)
  tipo_reproduccion: TipoReproduccionEnum = TipoReproduccionEnum.NATURAL;

  @IsOptional()
  @IsEnum(PurezaEnum, {
    message:
      'La pureza debe ser uno de: Puro, Puro por cruza, 3/4 raza, 1/2 raza, Criollo',
  })
  pureza: PurezaEnum;

  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComplementoDto)
  complementos: ComplementoDto[];

  @IsString()
  @IsOptional()
  medicamento?: string;

  @IsString({ message: 'El identificador debe ser un texto' })
  @IsNotEmpty({ message: 'El identificador del animal es obligatorio' })
  identificador: string;

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

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;

  @IsUUID('4', { message: 'El ID del propietario debe ser un UUID válido' })
  propietarioId: string;

  @IsUUID('4', { message: 'El ID de la finca debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La finca del animal es obligatoria' })
  fincaId: string;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean({ message: 'El valor de castrado debe ser verdadero o falso' })
  castrado?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El valor de la muerte debe ser verdadero o falso' })
  animal_muerte?: boolean;

  @IsString()
  @IsOptional()
  razon_muerte?: string;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean({ message: 'El valor de esterilizado debe ser verdadero o falso' })
  esterelizado?: boolean;

  @IsOptional()
  @IsBoolean({
    message: 'El valor de compra del padre debe ser verdadero o falso.',
  })
  compra_animal?: boolean;

  @IsOptional()
  @IsString({
    message:
      'El nombre del criador de origen del padre debe ser un texto válido.',
  })
  nombre_criador_origen_animal?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El padre debe ser un UUID válido' })
  padreId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'La madre debe ser un UUID válido' })
  madreId?: string;

  // --- DATOS PADRE ---
  @IsOptional()
  @IsString({ message: 'El nombre del padre debe ser un texto válido.' })
  nombre_padre?: string;

  @IsOptional()
  @IsString({ message: 'El arete del padre debe ser un texto válido.' })
  arete_padre?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray({ message: 'Las razas deben ser un arreglo de IDs válidos' })
  @IsUUID('4', {
    each: true,
    message: 'Cada raza del padre debe ser un UUID válido',
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
  @IsString({
    message: 'El nombre del criador del padre debe ser un texto válido.',
  })
  nombre_criador_padre: string;

  @IsOptional()
  @IsString({
    message: 'El nombre del propietario del padre debe ser un texto válido.',
  })
  nombre_propietario_padre: string;

  @IsOptional()
  @IsString({
    message: 'El nombre de la finca del padre debe ser un texto válido.',
  })
  nombre_finca_origen_padre: string;

  // --- DATOS MADRE ---
  @IsOptional()
  @IsString({ message: 'El nombre de la madre debe ser un texto válido.' })
  nombre_madre?: string;

  @IsOptional()
  @IsString({ message: 'El arete de la madre debe ser un texto válido.' })
  arete_madre: string;

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
  @IsString({
    message: 'El nombre del criador de la madre debe ser un texto válido.',
  })
  nombre_criador_madre: string;

  @IsOptional()
  @IsString({
    message: 'El nombre del propietario de la madre debe ser un texto válido.',
  })
  nombre_propietario_madre: string;

  @IsOptional()
  @IsString({
    message: 'El nombre de la finca de la madre debe ser un texto válido.',
  })
  nombre_finca_origen_madre?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;

    const num = Number(value);
    if (!Number.isFinite(num)) return undefined;

    return num;
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }

    if (typeof value === 'number') {
      return value;
    }

    return 0;
  })
  @IsNotEmpty({ message: 'El número de parto de la madre es obligatorio' })
  @IsNumber(
    {},
    { message: 'El número de parto de la madre debe ser un número.' },
  )
  @Min(1, { message: 'El número de parto debe ser mayor o igual a 0' })
  numero_parto_madre: number;

  //EQUINOS
  @IsOptional()
  @IsEnum(UsoEquinoEnum, {
    message: 'El uso del equino no es válido.',
  })
  uso_equino?: UsoEquinoEnum;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({
    message: 'El valor de desparasitado debe ser verdadero o falso.',
  })
  desparasitado?: boolean;

  @IsOptional()
  @IsString({
    message: 'Las vacunas deben ser un texto válido.',
  })
  vacunas?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
  @IsOptional()
  @IsNumber({}, { message: 'El peso actual debe ser un número válido.' })
  @Min(0, { message: 'El peso actual debe ser mayor o igual a 0.' })
  peso_actual?: number;

  @IsOptional()
  @IsString({
    message: 'La condición corporal debe ser un texto válido.',
  })
  condicion_corporal?: string;

  @IsOptional()
  @IsString({
    message: 'El nivel de entrenamiento debe ser un texto válido.',
  })
  nivel_entrenamiento?: string;

  @IsOptional()
  @IsString({
    message: 'Los resultados de competencias deben ser un texto válido.',
  })
  resultados_competencias?: string;

  @IsOptional()
  @IsString({
    message: 'Los registro genealogico debe ser un texto válido.',
  })
  registro_genealogico?: string;

  @IsOptional()
  @IsString({
    message: 'El historial reproductivo debe ser un texto válido.',
  })
  historial_reproductivo?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
  @IsOptional()
  @IsNumber({}, { message: 'El valor estimado debe ser un número válido.' })
  @Min(0, { message: 'El valor estimado debe ser mayor o igual a 0.' })
  valor_estimado?: number;

  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio de compra debe ser un número válido.' })
  @Min(0, { message: 'El precio de compra debe ser mayor o igual a 0.' })
  precio_compra?: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean({
    message: 'El valor de asegurado debe ser verdadero o falso.',
  })
  asegurado?: boolean;

  @IsOptional()
  @IsString({
    message: 'El veterinario debe ser un texto válido.',
  })
  veterinario?: string;

  @IsOptional()
  @IsString({
    message: 'La alzada debe ser un texto válido.',
  })
  alzada?: string;

  @IsOptional()
  @IsString({
    message: 'El microchip debe ser un texto válido.',
  })
  microchip?: string;

  @IsOptional()
  @IsString({
    message: 'La unidad de alzada debe ser un texto válido.',
  })
  unidad_alzada?: string;

  @IsOptional()
  @IsString({
    message: 'Las lesiones debe ser un texto válido.',
  })
  lesiones?: string;

  @IsOptional()
  @IsString({
    message: 'Las alergias debe ser un texto válido.',
  })
  alergias?: string;

  @IsOptional()
  @IsString({ message: 'La odontologia debe ser un texto valido' })
  odontologia: string;
}
