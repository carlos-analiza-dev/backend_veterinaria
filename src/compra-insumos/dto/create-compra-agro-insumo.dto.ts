import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateDetalleCompraInsumoDto } from './create-detalle-compra-insumo.dto';
import { TipoPago } from '../entities/compra-agro-insumo.entity';

export class CreateCompraAgroInsumoDto {
  @IsUUID()
  proveedorId: string;

  @IsUUID()
  sucursalId: string;

  @IsEnum(TipoPago)
  tipo_pago: TipoPago;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numero_factura?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  descuentos?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  impuestos: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  subtotal?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  total?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleCompraInsumoDto)
  detalles: CreateDetalleCompraInsumoDto[];
}
