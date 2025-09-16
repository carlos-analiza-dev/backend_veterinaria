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
} from 'class-validator';
import { TipoSubServicio, UnidadVenta } from '../entities/sub_servicio.entity';

export class CreateProductoDto {
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

  @IsString({ message: 'El código debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @MaxLength(20, { message: 'El código no debe superar los 20 caracteres.' })
  codigo: string;

  @IsUUID('4', { message: 'El marcaId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La marca es obligatoria para los productos.' })
  marcaId?: string;

  @IsUUID('4', { message: 'El proveedorId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio para los productos.' })
  proveedorId?: string;

  @IsUUID('4', { message: 'La categoria debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La categoria es obligatoria para los productos.' })
  categoriaId?: string;

  @IsString({ message: 'El código de barra debe ser una cadena de texto.' })
  @MaxLength(20, {
    message: 'El código de barra no debe exceder los 20 caracteres.',
  })
  @IsNotEmpty({ message: 'El código de barra es obligatorio para productos.' })
  codigo_barra?: string;

  @IsString({ message: 'Los atributos deben ser una cadena de texto.' })
  @MaxLength(250, {
    message: 'Los atributos no deben exceder los 250 caracteres.',
  })
  @IsNotEmpty({ message: 'Los atributos son obligatorios para productos.' })
  atributos?: string;

  @IsUUID('4', { message: 'El taxId debe ser un UUID válido.' })
  @IsNotEmpty({
    message: 'Los taxes o impuestos es obligatorio para productos.',
  })
  taxId?: string;

  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  @IsNotEmpty({ message: 'El precio es obligatorio para productos.' })
  precio?: number;

  @IsNumber({}, { message: 'El costo debe ser un número válido.' })
  @Min(0, { message: 'El costo no puede ser negativo.' })
  @IsNotEmpty({ message: 'El costo es obligatorio para productos.' })
  costo?: number;

  @IsUUID('4', { message: 'El paisId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El país es obligatorio para productos.' })
  paisId?: string;

  @IsOptional()
  @IsBoolean({
    message:
      'El campo es_compra_bodega debe ser un valor booleano (true o false).',
  })
  es_compra_bodega?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'La compra mínima debe ser un número válido.' })
  @Min(1, { message: 'La compra mínima debe ser al menos 1.' })
  compra_minima?: number;

  @IsOptional()
  @IsNumber(
    {},
    { message: 'La distribución mínima debe ser un número válido.' },
  )
  @Min(1, { message: 'La distribución mínima debe ser al menos 1.' })
  distribucion_minima?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La venta mínima debe ser un número válido.' })
  @Min(1, { message: 'La venta mínima debe ser al menos 1.' })
  venta_minima?: number;
}
