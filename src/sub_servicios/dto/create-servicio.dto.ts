import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TipoSubServicio, UnidadVenta } from '../entities/sub_servicio.entity';
import { Type } from 'class-transformer';
import { CreateServicioInsumoDto } from 'src/servicio_insumos/dto/create-servicio_insumo.dto';

export class CreateServicioDto {
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServicioInsumoDto)
  insumos?: CreateServicioInsumoDto[];
}
