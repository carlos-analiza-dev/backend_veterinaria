import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { UnidadVenta } from 'src/sub_servicios/entities/sub_servicio.entity';

export class ComponenteDto {
  @IsString({
    message: 'El nombre del componente debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'El nombre del componente es obligatorio.' })
  @MaxLength(150, {
    message: 'El nombre del componente no debe exceder los 150 caracteres.',
  })
  nombre: string;

  @IsString({ message: 'La cantidad debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(50, { message: 'La cantidad no debe exceder los 50 caracteres.' })
  cantidad?: string;

  @IsString({ message: 'La unidad debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(50, { message: 'La unidad no debe exceder los 50 caracteres.' })
  unidad?: string;
}

export class CreateAgroProductoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El nombre no debe exceder los 100 caracteres.' })
  @IsNotEmpty({ message: 'El nombre no debe estar vacío.' })
  nombre: string;

  @IsEnum(UnidadVenta, {
    message: `La unidad de venta debe ser uno de los siguientes valores: ${Object.values(
      UnidadVenta,
    ).join(', ')}`,
  })
  @IsOptional()
  unidad_venta?: UnidadVenta;

  @IsEnum(UnidadVenta, {
    message: `El tipo de fraccionamiento debe ser uno de los siguientes valores: ${Object.values(
      UnidadVenta,
    ).join(', ')}`,
  })
  @IsOptional()
  tipo_fraccionamiento?: UnidadVenta;

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

  @IsUUID('4', { message: 'La marca válido.' })
  @IsNotEmpty({ message: 'La marca es obligatoria para los productos.' })
  @IsOptional()
  marcaId?: string;

  @IsUUID('4', { message: 'El proveedorId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio para los productos.' })
  proveedorId?: string;

  @IsUUID('4', { message: 'La categoria debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La categoria es obligatoria para los productos.' })
  categoriaId?: string;

  @IsUUID('4', { message: 'La sub categoria debe ser un UUID válido.' })
  @IsNotEmpty({
    message: 'La sub categoria es obligatoria para los productos.',
  })
  subcategoriaId?: string;

  @IsUUID('4', { message: 'El tipo de producto debe ser valido.' })
  @IsNotEmpty({
    message: 'El tipo de producto es obligatoria para los productos.',
  })
  tipo_producto_id?: string;

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

  @IsOptional()
  @IsNumber(
    {},
    { message: 'La unidad de fraccionamiento debe ser un número válido.' },
  )
  @Min(1, { message: 'La unidad de fraccionamiento debe ser al menos 1.' })
  unidad_fraccionamiento?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El contenido debe ser un número válido.' })
  @Min(1, { message: 'La contenido debe ser al menos 1.' })
  contenido?: number;

  @IsArray({ message: 'Los componentes deben ser un array.' })
  @ValidateNested({
    each: true,
    message: 'Cada componente debe tener un formato válido.',
  })
  @Type(() => ComponenteDto)
  @IsOptional()
  componentes?: ComponenteDto[];

  @IsArray({ message: 'Los tipos de uso deben ser un array.' })
  @IsString({
    each: true,
    message: 'Cada tipo de uso debe ser una cadena de texto.',
  })
  @IsOptional()
  tipos_uso?: string[];

  @IsString({ message: 'La forma de uso debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(1000, {
    message: 'La forma de uso no debe exceder los 1000 caracteres.',
  })
  forma_uso?: string;

  @IsArray({ message: 'Las indicaciones deben ser un array.' })
  @IsString({
    each: true,
    message: 'Cada indicación debe ser una cadena de texto.',
  })
  @IsOptional()
  indicaciones?: string[];
}
