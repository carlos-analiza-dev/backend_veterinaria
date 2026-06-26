import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  IsNumber,
} from 'class-validator';

export enum EtapaPez {
  ALEVIN = 'Alevín',
  JUVENIL = 'Juvenil',
  ENGORDE = 'Engorde',
}

export class MuestreoDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de muestreo debe tener formato YYYY-MM-DD' },
  )
  fecha_muestreo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El peso debe ser un número' })
  peso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La talla debe ser un número' })
  talla?: number;
}

export class RecambioAguaDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha del recambio debe tener formato YYYY-MM-DD' },
  )
  fecha_recambio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    { message: 'El porcentaje de agua recambiada debe ser un número' },
  )
  porcentaje_recambio?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El volumen debe ser un número' })
  volumen_m3?: number;

  @IsOptional()
  @IsString({ message: 'El motivo del recambio debe ser un texto' })
  motivo?: string;

  @IsOptional()
  @IsString({ message: 'El responsable del recambio debe ser un texto' })
  responsable?: string;
}

export class CalidadAguaDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La temperatura debe ser un número' })
  temperatura?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El oxígeno disuelto debe ser un número' })
  oxigeno_disuelto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El pH debe ser un número' })
  ph?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El amonio debe ser un número' })
  amonio?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El nitrito debe ser un número' })
  nitrito?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La turbidez debe ser un número' })
  turbidez?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecambioAguaDto)
  historial_recambios?: RecambioAguaDto[];
}

export class SanidadDto {
  @IsOptional()
  @IsString({ message: 'Los signos clínicos deben ser un texto' })
  signos_clinicos?: string;

  @IsOptional()
  @IsString({ message: 'Los tratamientos deben ser un texto' })
  tratamientos?: string;

  @IsOptional()
  @IsString({ message: 'Los baños/salinidad deben ser un texto' })
  banos_salinidad?: string;

  @IsOptional()
  @IsString({ message: 'El laboratorio debe ser un texto' })
  laboratorio?: string;
}

export class CosechaDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de cosecha debe tener formato YYYY-MM-DD' },
  )
  fecha_cosecha?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Los kilos cosechados deben ser un número' })
  kilos_cosechados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La sobrevivencia debe ser un número' })
  sobrevivencia_porcentaje?: number;

  @IsOptional()
  @IsString({ message: 'El comprador debe ser un texto' })
  comprador?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número' })
  precio?: number;
}

export class CreatePecesDto {
  @IsUUID('4', { message: 'La especie debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La especie del animal es obligatoria' })
  especie: string;

  @IsUUID('4', { message: 'El ID de la finca debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La finca del animal es obligatoria' })
  fincaId: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @IsArray({ message: 'Las razas deben ser un arreglo de IDs válidos' })
  @IsUUID('4', { each: true, message: 'Cada raza debe ser un UUID válido' })
  @IsNotEmpty({ message: 'Debes ingresar al menos una raza' })
  razaIds: string[];

  @IsOptional()
  @IsString({ message: 'El identificador debe ser un texto' })
  identificador?: string;

  @IsOptional()
  @IsString({ message: 'El estanque/tanque/jaula debe ser un texto' })
  estanque_tanque_jaula?: string;

  @IsOptional()
  @IsString({ message: 'El proveedor de alevines debe ser un texto' })
  proveedor_alevines?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de siembra debe tener formato YYYY-MM-DD' },
  )
  fecha_siembra?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad inicial debe ser un número' })
  cantidad_inicial?: number;

  @IsOptional()
  @IsString({ message: 'La talla/peso inicial debe ser un texto' })
  talla_peso_inicial?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La densidad debe ser un número' })
  densidad_por_m3_m2?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad actual debe ser un número' })
  cantidad_actual?: number;

  @IsOptional()
  @IsString({ message: 'La mortalidad diaria/acumulada debe ser un texto' })
  mortalidad_diaria_acum?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }

    if (Array.isArray(value)) {
      return value;
    }
    return [];
  })
  @IsOptional()
  @IsArray({ message: 'muestreos debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => MuestreoDto)
  muestreos?: MuestreoDto[];

  @IsOptional()
  @IsEnum(EtapaPez, {
    message: 'La etapa no es válida',
  })
  etapa?: EtapaPez;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El peso promedio debe ser un número' })
  peso_promedio?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La biomasa estimada debe ser un número' })
  biomasa_estimada?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La talla debe ser un número' })
  talla?: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de muestreo debe tener formato YYYY-MM-DD' },
  )
  fecha_muestreo?: string;

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
  @Type(() => CalidadAguaDto)
  calidad_agua?: CalidadAguaDto;

  @IsOptional()
  @IsString({ message: 'El tipo de concentrado debe ser un texto' })
  tipo_concentrado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El porcentaje de proteína debe ser un número' })
  proteina_porcentaje?: number;

  @IsOptional()
  @IsString({ message: 'La ración diaria debe ser un texto' })
  racion_diaria?: string;

  @IsOptional()
  @IsString({ message: 'El consumo debe ser un texto' })
  consumo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La conversión alimenticia debe ser un número' })
  conversion_alimenticia?: number;

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
  @Type(() => SanidadDto)
  sanidad?: SanidadDto;

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
  @Type(() => CosechaDto)
  cosecha?: CosechaDto;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    return true;
  })
  @IsOptional()
  @IsBoolean({ message: 'El valor de lote activo debe ser verdadero o falso' })
  lote_activo?: boolean;
}
