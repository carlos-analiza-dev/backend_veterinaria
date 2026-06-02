import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { Type, Transform } from 'class-transformer';
import { TipoPublicacion } from 'src/interfaces/market/tipo_publicacion.enum';

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
  @IsString({
    message: 'El modelo debe ser de formato texto',
  })
  modelo?: string;

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

  @IsEnum(TipoPublicacion, {
    message: `Ocurrio un error, asegurate que el tipo de publicacion sea el correcto`,
  })
  @IsOptional()
  tipo_publicacion: TipoPublicacion;

  @IsUUID('4', {
    message: 'La subcategoría debe ser un UUID válido',
  })
  subcategoriaId: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'La marca debe ser un UUID válido',
  })
  marcaId?: string;

  @IsOptional()
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

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({
    message: 'El campo vendido debe ser verdadero o falso',
  })
  vendido?: boolean;
}
