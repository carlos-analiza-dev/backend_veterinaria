import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { Type, Transform } from 'class-transformer';

export class CreateMarketplaceAnimaleDto {
  @IsUUID('4', {
    message: 'El ID del animal debe ser un UUID válido',
  })
  animalId: string;

  @IsString({
    message: 'El nombre del producto es obligatorio y debe ser un texto',
  })
  nombre: string;

  @IsString({
    message: 'La descripción es obligatoria y debe ser un texto',
  })
  descripcion: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  longitud?: number;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  direccion_completa: string;

  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'El precio debe ser un número válido (ej: 1500.00)',
    },
  )
  precio: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'El precio de oferta debe ser un número válido',
    },
  )
  precio_oferta?: number;

  @IsString({
    message: 'La moneda es obligatoria (ej: HNL, USD)',
  })
  moneda: string;

  @Type(() => Number)
  @IsInt({
    message: 'El stock debe ser un número entero',
  })
  @Min(1, {
    message: 'El stock mínimo permitido es 1',
  })
  stock: number;

  @IsUUID('4', {
    message: 'La categoría debe ser un UUID válido',
  })
  categoriaId: string;

  @IsUUID('4', {
    message: 'La subcategoría debe ser un UUID válido',
  })
  subcategoriaId: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'La marca debe ser un UUID válido',
  })
  marcaId?: string;

  @IsUUID('4', {
    message: 'El tipo de producto debe ser un UUID válido',
  })
  tipoProductoId?: string;

  @IsUUID('4', {
    message: 'El departamento debe ser un UUID válido',
  })
  departamentoId: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({
    message: 'El campo disponible debe ser verdadero o falso',
  })
  disponible?: boolean;
}
