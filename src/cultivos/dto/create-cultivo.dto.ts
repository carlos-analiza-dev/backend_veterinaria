import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import {
  MetodoSiembra,
  TipoCultivoEnum,
  TipoSistemaRiego,
  TipoSuelo,
} from 'src/interfaces/cultivos/cultivo.enums';

export class CreateCultivoDto {
  @IsString({
    message: 'El nombre del cultivo debe ser un texto válido',
  })
  @Length(2, 150, {
    message: 'El nombre del cultivo debe tener entre 2 y 150 caracteres',
  })
  nombre_cultivo: string;

  @IsOptional()
  @IsString({
    message: 'La variedad debe ser un texto válido',
  })
  @Length(2, 100, {
    message: 'La variedad debe tener entre 2 y 100 caracteres',
  })
  variedad?: string;

  @IsEnum(TipoCultivoEnum, {
    message: 'El tipo de cultivo debe ser uno de los valores permitidos',
  })
  tipo_cultivo: TipoCultivoEnum;

  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El área sembrada debe ser un número válido',
    },
  )
  @Min(0, {
    message: 'El área sembrada no puede ser menor a 0',
  })
  area_sembrada: number;

  @IsOptional()
  @IsString({
    message: 'La unidad de medida debe ser un texto válido',
  })
  unidad_medida?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de siembra debe tener un formato válido',
    },
  )
  fecha_siembra?: Date;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha estimada de cosecha debe tener un formato válido',
    },
  )
  fecha_cosecha_estimada?: Date;

  @IsOptional()
  @IsString({
    message: 'La temporada debe ser un texto válido',
  })
  @Length(2, 100, {
    message: 'La temporada debe tener entre 2 y 100 caracteres',
  })
  temporada?: string;

  @IsEnum(TipoSuelo, {
    message: 'El tipo de suelo no es válido',
  })
  tipo_suelo: TipoSuelo;

  @IsOptional()
  @IsString({
    message: 'El pH del suelo debe ser un texto válido',
  })
  ph_suelo?: string;

  @IsEnum(MetodoSiembra, {
    message: 'El método de siembra no es válido',
  })
  metodo_siembra: MetodoSiembra;

  @IsEnum(TipoSistemaRiego, {
    message: 'El sistema de riego no es válido',
  })
  sistema_riego: TipoSistemaRiego;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'La producción estimada debe ser un número válido',
    },
  )
  @Min(0, {
    message: 'La producción estimada no puede ser menor a 0',
  })
  produccion_estimada?: number;

  @IsOptional()
  @IsString({
    message: 'La unidad de producción debe ser un texto válido',
  })
  unidad_produccion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El costo de semilla debe ser un número válido',
    },
  )
  @Min(0, {
    message: 'El costo de semilla no puede ser menor a 0',
  })
  costo_semilla?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El costo de fertilizantes debe ser un número válido',
    },
  )
  @Min(0, {
    message: 'El costo de fertilizantes no puede ser menor a 0',
  })
  costo_fertilizantes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El costo de mano de obra debe ser un número válido',
    },
  )
  @Min(0, {
    message: 'El costo de mano de obra no puede ser menor a 0',
  })
  costo_mano_obra?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'Otros costos deben ser un número válido',
    },
  )
  @Min(0, {
    message: 'Otros costos no pueden ser menores a 0',
  })
  otros_costos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El ingreso estimado debe ser un número válido',
    },
  )
  ingreso_estimado?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'La ganancia estimada debe ser un número válido',
    },
  )
  ganancia_estimada?: number;

  @IsUUID('4', {
    message: 'El ID de la finca no es válido',
  })
  fincaId: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser verdadero o falso',
  })
  isActive?: boolean;
}
