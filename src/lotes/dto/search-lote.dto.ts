import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { EstadoLote } from '../entities/lote.entity';

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
  @IsEnum(EstadoLote, {
    message: `El estatus debe ser uno de los valores: ${Object.values(EstadoLote).join(', ')}`,
  })
  estatus?: EstadoLote;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  vencidosProximos?: boolean;
}