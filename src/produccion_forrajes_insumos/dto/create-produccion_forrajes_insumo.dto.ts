import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export type InsumoTipo =
  | 'Heno'
  | 'Silo'
  | 'Pasto'
  | 'Harina'
  | 'Alimentos Concentrados elaborados'
  | 'Otros';

export class InsumoForrajeDto {
  @IsEnum([
    'Heno',
    'Silo',
    'Pasto',
    'Harina',
    'Alimentos Concentrados elaborados',
    'Otros',
  ])
  tipo: InsumoTipo;

  @IsOptional()
  @IsString()
  tipo_heno?: string;

  @IsOptional()
  @IsString()
  estacionalidad_heno?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  meses_produccion_heno?: string[];

  @IsOptional()
  @IsString()
  tiempo_estimado_cultivo?: string;

  @IsOptional()
  @IsString()
  produccion_manzana?: string;

  @IsOptional()
  @IsString()
  descripcion_otro?: string;
}

export class CreateProduccionForrajesInsumoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsumoForrajeDto)
  insumos: InsumoForrajeDto[];

  @IsUUID('4', { message: 'Debe enviar un ID válido de la producción' })
  produccionFincaId: string;
}
