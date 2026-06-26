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
} from 'class-validator';
import { TipoAlimentacionDto } from './create-animal_finca.dto';
import { TipoAve } from 'src/interfaces/animales/animales-enums';

export class CreateAvicolaDto {
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

  @IsString({ message: 'El identificador debe ser un texto' })
  @IsNotEmpty({ message: 'El identificador del galpon es obligatorio' })
  identificador: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La cantidad del lote debe ser un número entero' })
  @Min(0)
  cantidad_lote: number;

  @IsOptional()
  @IsEnum(TipoAve, {
    message: 'El tipo de ave no es válido',
  })
  tipo_ave: TipoAve;

  @IsOptional()
  @IsString({ message: 'El proveedor de aves debe ser un texto' })
  proveedor_aves?: string;

  @IsOptional()
  @IsString({ message: 'El galpón debe ser un texto' })
  galpon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La mortalidad diaria debe ser un número entero' })
  @Min(0)
  mortalidad_diaria?: number;

  @IsOptional()
  @IsString({ message: 'El consumo de alimento debe ser un texto' })
  consumo_alimento?: string;

  @IsOptional()
  @IsString({ message: 'El consumo de agua debe ser un texto' })
  consumo_agua?: string;

  @IsOptional()
  @IsString({ message: 'El peso promedio debe ser un texto' })
  peso_promedio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Los huevos diarios deben ser un número entero' })
  @Min(0)
  huevos_diarios?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Los huevos rotos deben ser un número entero' })
  @Min(0)
  huevos_rotos?: number;

  @IsOptional()
  @IsString({ message: 'La calificación de huevos debe ser un texto' })
  calificacion_huevos?: string;

  @IsOptional()
  @IsString({ message: 'Las vacunas del lote deben ser un texto' })
  vacunas_lote?: string;

  @IsOptional()
  @IsString({ message: 'Los tratamientos deben ser un texto' })
  tratamientos?: string;

  @IsOptional()
  @IsString({ message: 'El porcentaje de postura debe ser un texto' })
  porcentaje_postura?: string;

  @IsOptional()
  @IsString({ message: 'El tipo de concentrado debe ser un texto' })
  tipo_concentrado?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de postura debe tener formato YYYY-MM-DD' },
  )
  fecha_postura?: string;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean({ message: 'El valor de castrado debe ser verdadero o falso' })
  lote_activo?: boolean;
}
