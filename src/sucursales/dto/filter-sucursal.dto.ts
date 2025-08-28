import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoSucursal } from '../entities/sucursal.entity';
import { PaginationDto } from '../../common/dto/pagination-common.dto';

export class FilterSucursalDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TipoSucursal)
  tipo?: TipoSucursal;

  @IsUUID('4', { message: 'El paisId debe ser un UUID válido' })
  @IsOptional()
  paisId?: string;

  @IsUUID('4', { message: 'El departamentoId debe ser un UUID válido' })
  @IsOptional()
  departamentoId?: string;

  @IsUUID('4', { message: 'El municipioId debe ser un UUID válido' })
  @IsOptional()
  municipioId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string; // Para búsqueda por nombre
}
