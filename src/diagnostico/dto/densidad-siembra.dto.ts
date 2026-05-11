import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DensidadSiembraDto {
  @IsString()
  cultivo: string;

  @IsOptional()
  @IsString()
  tipoTerreno?: string;

  @IsOptional()
  @IsString()
  clima?: string;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsString()
  unidad?: string;
}
