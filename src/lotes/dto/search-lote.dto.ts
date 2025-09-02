import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

export class SearchLoteDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @IsOptional()
  productoId?: string;

  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  @IsOptional()
  proveedorId?: string;

  @IsOptional()
  @IsString()
  estatus?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  vencidosProximos?: boolean;
}