import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { EstadoParto, TipoParto } from 'src/interfaces/partos.enums';

export class FiltrarPartosDto {
  @IsOptional()
  @IsUUID()
  finca_id?: string;

  @IsOptional()
  @IsUUID()
  hembra_id?: string;

  @IsOptional()
  @IsUUID()
  servicio_id?: string;

  @IsOptional()
  @IsEnum(TipoParto)
  tipo_parto?: TipoParto;

  @IsOptional()
  @IsEnum(EstadoParto)
  estado?: EstadoParto;

  @IsOptional()
  @IsDateString()
  fecha_desde?: Date;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
