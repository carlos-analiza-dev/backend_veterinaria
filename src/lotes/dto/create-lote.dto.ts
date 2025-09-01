import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoLote, TipoMoneda, UnidadMedida } from '../entities/lote.entity';

export class CreateLoteDto {
  @IsNotEmpty({ message: 'El número de lote o color es obligatorio' })
  @IsString({ message: 'El número de lote o color debe ser una cadena' })
  @MaxLength(100, {
    message: 'El número de lote o color no puede exceder 100 caracteres',
  })
  numero_lote_color: string;

  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  productoId: string;

  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del proveedor es obligatorio' })
  proveedorId: string;

  @IsNotEmpty({ message: 'El ID de orden de compra es obligatorio' })
  @IsString({ message: 'El ID de orden de compra debe ser una cadena' })
  @MaxLength(100, {
    message: 'El ID de orden de compra no puede exceder 100 caracteres',
  })
  orden_compra_id: string;

  @IsDateString({}, { message: 'La fecha de compra debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de compra es obligatoria' })
  fecha_compra: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe ser una fecha válida' },
  )
  fecha_vencimiento?: string;

  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'La cantidad total debe ser un número válido' },
  )
  @IsPositive({ message: 'La cantidad total debe ser positiva' })
  @Type(() => Number)
  cantidad_total: number;

  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'La cantidad disponible debe ser un número válido' },
  )
  @Min(0, { message: 'La cantidad disponible no puede ser negativa' })
  @Type(() => Number)
  cantidad_disponible: number;

  @IsEnum(UnidadMedida, {
    message: `La unidad de medida debe ser uno de los valores: ${Object.values(UnidadMedida).join(', ')}`,
  })
  unidad_medida: UnidadMedida;

  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'El costo unitario debe ser un número válido' },
  )
  @IsPositive({ message: 'El costo unitario debe ser positivo' })
  @Type(() => Number)
  costo_unitario: number;

  @IsEnum(TipoMoneda, {
    message: `La moneda debe ser uno de los valores: ${Object.values(TipoMoneda).join(', ')}`,
  })
  moneda: TipoMoneda;

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser una cadena' })
  @MaxLength(200, { message: 'La ubicación no puede exceder 200 caracteres' })
  ubicacion?: string;

  @IsOptional()
  @IsEnum(EstadoLote, {
    message: `El estatus debe ser uno de los valores: ${Object.values(EstadoLote).join(', ')}`,
  })
  estatus?: EstadoLote;

  @IsOptional()
  @IsString({ message: 'El número de registro sanitario debe ser una cadena' })
  @MaxLength(100, {
    message: 'El número de registro sanitario no puede exceder 100 caracteres',
  })
  numero_registro_sanitario?: string;
}