import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsPositive,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoPublicacion } from 'src/interfaces/market/tipo_publicacion.enum';

export class NearbySucursalesDto {
  @IsLatitude()
  latitud: number;

  @IsLongitude()
  longitud: number;

  @IsString()
  @IsOptional()
  especie?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsEnum(TipoPublicacion)
  @IsOptional()
  tipo_publicacion?: TipoPublicacion;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limite?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  radio?: number = 600;

  @IsOptional()
  usarGoogleMaps?: boolean = true;
}
