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
import {
  EstadoFactura,
  FormaPago,
} from '../entities/factura_encabezado.entity';
import { Type } from 'class-transformer';
import { CreateFacturaDetalleDto } from 'src/factura_detalle/dto/create-factura_detalle.dto';

export class UpdateFacturaEncabezadoDto {
  @IsUUID('4', { message: 'El campo "id_cliente" debe ser un UUID válido.' })
  @IsOptional()
  id_cliente?: string;

  @IsOptional()
  descuento_id: string;

  @IsEnum(FormaPago, {
    message: `El campo "forma_pago" debe ser uno de los siguientes valores válidos: ${Object.values(
      FormaPago,
    ).join(', ')}.`,
  })
  @IsOptional()
  forma_pago?: FormaPago;

  @IsEnum(EstadoFactura, {
    message:
      'El estado de la factura debe ser válido. Opciones: "Emitida", "Procesada" o "Cancelada".',
  })
  @IsOptional()
  estado?: EstadoFactura;

  @IsNumber({}, { message: 'El campo "sub_total" debe ser un número válido.' })
  @IsPositive({ message: 'El campo "sub_total" debe ser un número positivo.' })
  @IsOptional()
  sub_total?: number;

  @IsNumber(
    {},
    { message: 'El campo "descuentos_rebajas" debe ser un número válido.' },
  )
  @IsOptional()
  descuentos_rebajas?: number;

  @IsArray({ message: 'El campo "detalles" debe ser un arreglo.' })
  @ArrayMinSize(1, {
    message: 'Debe incluir al menos un detalle en la factura.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateFacturaDetalleDto)
  @IsOptional()
  detalles?: CreateFacturaDetalleDto[];

  @IsNumber(
    {},
    { message: 'El campo "importe_exento" debe ser un número válido.' },
  )
  @IsOptional()
  importe_exento?: number;

  @IsNumber(
    {},
    { message: 'El campo "importe_exonerado" debe ser un número válido.' },
  )
  @IsOptional()
  importe_exonerado?: number;

  @IsNumber(
    {},
    { message: 'El campo "importe_gravado_15" debe ser un número válido.' },
  )
  @IsOptional()
  importe_gravado_15?: number;

  @IsNumber(
    {},
    { message: 'El campo "importe_gravado_18" debe ser un número válido.' },
  )
  @IsOptional()
  importe_gravado_18?: number;

  @IsNumber({}, { message: 'El campo "isv_15" debe ser un número válido.' })
  @IsOptional()
  isv_15?: number;

  @IsNumber({}, { message: 'El campo "isv_18" debe ser un número válido.' })
  @IsOptional()
  isv_18?: number;
}
