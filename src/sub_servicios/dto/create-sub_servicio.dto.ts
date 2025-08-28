import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
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

  @ValidateIf((o) => o.tipo === TipoSubServicio.SERVICIO)
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

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsString({ message: 'El código debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @MaxLength(20, { message: 'El código no debe superar los 20 caracteres.' })
  codigo: string;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsUUID('4', { message: 'El marcaId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La marca es obligatoria para los productos.' })
  marcaId?: string;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsUUID('4', { message: 'El proveedorId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio para los productos.' })
  proveedorId?: string;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsUUID('4', { message: 'La categoria debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La categoria es obligatoria para los productos.' })
  categoriaId?: string;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsString({ message: 'El código de barra debe ser una cadena de texto.' })
  @MaxLength(20, {
    message: 'El código de barra no debe exceder los 20 caracteres.',
  })
  @IsNotEmpty({ message: 'El código de barra es obligatorio para productos.' })
  codigo_barra?: string;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsString({ message: 'Los atributos deben ser una cadena de texto.' })
  @MaxLength(250, {
    message: 'Los atributos no deben exceder los 250 caracteres.',
  })
  @IsNotEmpty({ message: 'Los atributos son obligatorios para productos.' })
  atributos?: string;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsUUID('4', { message: 'El taxId debe ser un UUID válido.' })
  @IsNotEmpty({
    message: 'Los taxes o impuestos es obligatorio para productos.',
  })
  taxId?: string;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  @IsNotEmpty({ message: 'El precio es obligatorio para productos.' })
  precio?: number;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsNumber({}, { message: 'El costo debe ser un número válido.' })
  @Min(0, { message: 'El costo no puede ser negativo.' })
  @IsNotEmpty({ message: 'El costo es obligatorio para productos.' })
  costo?: number;

  @ValidateIf((o) => o.tipo === TipoSubServicio.PRODUCTO)
  @IsUUID('4', { message: 'El paisId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El país es obligatorio para productos.' })
  paisId?: string;
}
