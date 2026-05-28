import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NearbySucursalesDto {
  @IsLatitude()
  latitud: number;

  @IsLongitude()
  longitud: number;

  @IsString()
  @IsOptional()
  especie?: string;

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
  radio?: number = 300;

  @IsOptional()
  usarGoogleMaps?: boolean = true;
}
