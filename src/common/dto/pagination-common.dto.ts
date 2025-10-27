import { Type } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { EstadoPedido } from 'src/pedidos/entities/pedido.entity';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsString()
  producto?: string;

  @IsOptional()
  @IsString()
  tipo_categoria?: string;

  @IsOptional()
  @IsString()
  estado?: EstadoPedido;

  @IsOptional()
  @IsString()
  insumo?: string;

  @IsOptional()
  @IsString()
  sucursal?: string;

  @IsOptional()
  @IsString()
  tipoPago?: string;

  @IsOptional()
  @IsString()
  numeroFactura?: string;

  @IsOptional()
  @IsString()
  servicio?: string;

  @IsOptional()
  @IsString()
  rol?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  fincaId?: string;

  @IsOptional()
  @IsString()
  especieId?: string;

  @IsOptional()
  @IsString()
  identificador?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsDateString()
  year?: number;
}
