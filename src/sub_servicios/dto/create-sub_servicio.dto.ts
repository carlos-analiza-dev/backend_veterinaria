import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { TipoSubServicio, UnidadVenta } from '../entities/sub_servicio.entity';

export class CreateSubServicioDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El nombre no debe exceder los 100 caracteres.' })
  @IsNotEmpty({ message: 'El nombre no debe estar vacío.' })
  nombre: string;

  @IsEnum(TipoSubServicio, {
    message: `El tipo debe ser uno de los siguientes valores: ${Object.values(
      TipoSubServicio,
    ).join(', ')}`,
  })
  @IsOptional()
  tipo?: TipoSubServicio;

  @IsEnum(UnidadVenta, {
    message: `La unidad de venta debe ser uno de los siguientes valores: ${Object.values(
      UnidadVenta,
    ).join(', ')}`,
  })
  @IsOptional()
  unidad_venta?: UnidadVenta;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La descripción no debe estar vacía.' })
  descripcion: string;

  @ValidateIf((o) => o.tipo === TipoSubServicio.SERVICIO)
  @IsUUID('4', { message: 'El ID del servicio debe ser un UUID válido.' })
  servicioId?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El campo isActive debe ser un valor booleano (true o false).',
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({
    message: 'El campo disponible debe ser un valor booleano (true o false).',
  })
  disponible?: boolean;

  @IsNumber()
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  precio: number;

  @ValidateIf((o) => o.tipo === TipoSubServicio.SERVICIO)
  @IsNumber({}, { message: 'El tiempo debe ser un número.' })
  tiempo?: number;

  @ValidateIf((o) => o.tipo === TipoSubServicio.SERVICIO)
  @IsNumber({}, { message: 'La cantidad mínima debe ser un número.' })
  cantidadMin?: number;

  @ValidateIf((o) => o.tipo === TipoSubServicio.SERVICIO)
  @IsNumber({}, { message: 'La cantidad máxima debe ser un número.' })
  cantidadMax?: number;

  @IsUUID()
  paisId: string;
}
