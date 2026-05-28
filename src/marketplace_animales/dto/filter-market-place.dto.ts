import { IsOptional, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterMarketplaceAnimalesDto {
  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsUUID()
  subcategoriaId?: string;

  @IsOptional()
  @IsUUID()
  tipoProductoId?: string;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number = 12;

  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;
}
