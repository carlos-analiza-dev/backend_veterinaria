import { IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GananciaPesoFiltersDto {
  @IsOptional()
  @IsUUID()
  fincaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2020)
  @Max(2100)
  año?: number;

  @IsOptional()
  @IsUUID()
  animalId?: string;
}
