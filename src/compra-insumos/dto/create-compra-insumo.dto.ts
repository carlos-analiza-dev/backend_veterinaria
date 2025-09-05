import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TipoPago } from '../entities/compra-insumo.entity';
import { CreateDetalleCompraInsumoDto } from './create-detalle-compra-insumo.dto';

export class CreateCompraInsumoDto {
  @IsUUID()
  proveedorId: string;

  @IsUUID()
  sucursalId: string;

  @IsEnum(TipoPago)
  tipo_pago: TipoPago;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleCompraInsumoDto)
  detalles: CreateDetalleCompraInsumoDto[];
}