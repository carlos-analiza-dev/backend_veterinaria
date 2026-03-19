import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import {
  TipoServicio,
  EstadoServicio,
} from 'src/interfaces/servicios-reproductivos.enum';

export class FilterServiciosDto {
  @IsOptional()
  @IsUUID()
  hembra_id?: string;

  @IsOptional()
  @IsUUID()
  finca_id?: string;

  @IsOptional()
  @IsEnum(TipoServicio)
  tipo_servicio?: TipoServicio;

  @IsOptional()
  @IsEnum(EstadoServicio)
  estado?: EstadoServicio;

  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @IsOptional()
  @IsBoolean()
  exitoso?: boolean;

  @IsOptional()
  @IsBoolean()
  con_gestacion?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
