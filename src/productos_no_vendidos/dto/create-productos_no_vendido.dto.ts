import {
  IsUUID,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Motivo } from '../entities/productos_no_vendido.entity';

export class CreateProductosNoVendidoDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido.' })
  producto_id: string;

  @IsUUID('4', { message: 'La sucursal debe ser un UUID válido.' })
  sucursal_id: string;

  @IsString({ message: 'El nombre del producto debe ser un texto.' })
  @MaxLength(255, {
    message: 'El nombre del producto no puede superar los 255 caracteres.',
  })
  nombre_producto: string;

  @IsInt({ message: 'La cantidad no vendida debe ser un número entero.' })
  @Min(1, { message: 'La cantidad no vendida debe ser al menos 1.' })
  cantidad_no_vendida: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'El precio unitario debe ser un número con hasta dos decimales.',
    },
  )
  @Min(0, { message: 'El precio unitario no puede ser negativo.' })
  precio_unitario: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El total perdido debe ser un número con hasta dos decimales.' },
  )
  @Min(0, { message: 'El total perdido no puede ser negativo.' })
  total_perdido: number;

  @IsInt({ message: 'La existencia actual debe ser un número entero.' })
  @Min(0, { message: 'La existencia actual no puede ser negativa.' })
  existencia_actual: number;

  @IsInt({ message: 'La cantidad solicitada debe ser un número entero.' })
  @Min(1, { message: 'La cantidad solicitada debe ser al menos 1.' })
  cantidad_solicitada: number;

  @IsEnum(Motivo, {
    message:
      'El motivo debe ser uno de los siguientes valores: Sin_Stock o Venta_Incompleta.',
  })
  motivo: Motivo;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto.' })
  observaciones?: string;

  @IsBoolean({
    message: 'El campo "fue_reabastecido" debe ser verdadero o falso.',
  })
  @IsOptional()
  fue_reabastecido?: boolean;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de reabastecimiento debe tener un formato de fecha válido (ISO 8601).',
    },
  )
  fecha_reabastecimiento?: Date;
}
