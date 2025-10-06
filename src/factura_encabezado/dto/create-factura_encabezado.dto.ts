import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { FormaPago } from '../entities/factura_encabezado.entity';
import { Type } from 'class-transformer';
import { CreateFacturaDetalleDto } from 'src/factura_detalle/dto/create-factura_detalle.dto';

export class CreateFacturaEncabezadoDto {
  @IsUUID()
  id_cliente: string;

  @IsEnum(FormaPago)
  forma_pago: FormaPago;

  @IsNumber()
  @IsPositive()
  sub_total: number;

  @IsNumber()
  @IsOptional()
  descuentos_rebajas?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFacturaDetalleDto)
  detalles: CreateFacturaDetalleDto[];

  @IsNumber()
  @IsOptional()
  importe_exento?: number;

  @IsNumber()
  @IsOptional()
  importe_exonerado?: number;

  @IsNumber()
  @IsOptional()
  importe_gravado_15?: number;

  @IsNumber()
  @IsOptional()
  importe_gravado_18?: number;

  @IsNumber()
  @IsOptional()
  isv_15?: number;

  @IsNumber()
  @IsOptional()
  isv_18?: number;
}
