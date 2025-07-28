import {
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ActividadAlternativaDto {
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  cantidad_producida?: string;

  @IsOptional()
  @IsString()
  unidad_medida?: string;

  @IsOptional()
  @IsNumber()
  ingresos_anuales?: number;
}

export class CreateProduccionAlternativaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActividadAlternativaDto)
  actividades: ActividadAlternativaDto[];
}
