import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export type CultivoTipo =
  | 'Maíz'
  | 'Frijol'
  | 'Arroz'
  | 'Sorgo'
  | 'Café'
  | 'Papa'
  | 'Tomate'
  | 'Cebolla'
  | 'Ajo'
  | 'Yuca'
  | 'Hortalizas'
  | 'Frutas'
  | 'Otros';

export type MetodoCultivo = 'Tradicional' | 'Orgánico' | 'Invernadero';

export class CultivoDto {
  @IsEnum([
    'Maíz',
    'Frijol',
    'Arroz',
    'Sorgo',
    'Café',
    'Papa',
    'Tomate',
    'Cebolla',
    'Ajo',
    'Yuca',
    'Hortalizas',
    'Frutas',
    'Otros',
  ])
  @IsOptional()
  tipo: CultivoTipo;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  estacionalidad: string;

  @IsString()
  tiempo_estimado_cultivo: string;

  @IsArray()
  @IsString({ each: true })
  meses_produccion: string[];

  @IsString()
  cantidad_producida_hectareas: string;
}

export class CreateProduccionAgricolaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CultivoDto)
  cultivos: CultivoDto[];
}
