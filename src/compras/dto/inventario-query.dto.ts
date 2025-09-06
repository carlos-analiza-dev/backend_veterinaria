import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

export enum TipoInventario {
  PRODUCTOS = 'productos',
  INSUMOS = 'insumos',
  AMBOS = 'ambos',
}

export class InventarioQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TipoInventario)
  tipo?: TipoInventario = TipoInventario.AMBOS;

  @IsOptional()
  @IsUUID()
  sucursalId?: string;

  @IsOptional()
  @IsString()
  sucursal?: string;

  @IsOptional()
  @IsUUID()
  marcaId?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  codigo?: string;
}