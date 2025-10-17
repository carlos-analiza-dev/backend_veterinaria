import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TipoMovimiento } from '../entities/movimientos_lote.entity';

export class CreateMovimientosLoteDto {
  @IsUUID()
  @IsNotEmpty()
  lote_id: string;

  @IsUUID()
  @IsOptional()
  factura_id?: string;

  @IsUUID()
  @IsNotEmpty()
  producto_id: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  cantidad: number;

  @IsEnum(TipoMovimiento)
  @IsOptional()
  tipo?: TipoMovimiento;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  cantidad_anterior: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  cantidad_nueva: number;
}
