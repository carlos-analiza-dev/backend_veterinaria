import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NearbySucursalesDto {
  @IsLatitude()
  latitud: number;

  @IsLongitude()
  longitud: number;

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
