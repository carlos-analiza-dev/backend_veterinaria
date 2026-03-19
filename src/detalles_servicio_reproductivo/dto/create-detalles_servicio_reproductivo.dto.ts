import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class ComportamientoDto {
  @IsOptional()
  @IsBoolean()
  aceptacion_macho?: boolean;

  @IsOptional()
  @IsString()
  receptividad?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  signos_observados?: string[];
}

export class CreateDetallesServicioReproductivoDto {
  @IsString()
  hora_servicio: string;

  @IsNumber()
  @Min(1)
  numero_monta: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duracion_minutos?: number;

  @IsOptional()
  @IsString()
  observaciones_monta?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ComportamientoDto)
  comportamiento?: ComportamientoDto;
}

export class UpdateDetallesServicioReproductivoDto extends CreateDetallesServicioReproductivoDto {}
