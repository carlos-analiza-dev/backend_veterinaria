import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  Length,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';

export class EspecieCantidadDto {
  @IsString()
  @Length(1, 100)
  especie: string;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor o igual a 1' })
  cantidad: number;
}

export class TipoFinca {
  @IsString()
  @Length(1, 100)
  tipo_explotacion: string;
}

export class CreateFincasGanaderoDto {
  @IsString()
  @Length(3, 150)
  nombre_finca: string;

  @IsInt()
  cantidad_animales: number;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  ubicacion?: string;

  @IsOptional()
  @Type(() => Number)
  latitud?: number;

  @IsOptional()
  @Type(() => Number)
  longitud?: number;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  abreviatura?: string;

  @IsString()
  @Length(0, 50)
  medida_finca?: string;

  @IsUUID()
  departamentoId: string;

  @IsUUID()
  municipioId: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  tamaño_total_hectarea?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  area_ganaderia_hectarea?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TipoFinca)
  tipo_explotacion?: TipoFinca[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EspecieCantidadDto)
  especies_maneja: EspecieCantidadDto[];

  @IsUUID()
  propietario_id: string;

  @IsUUID()
  pais_id: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
