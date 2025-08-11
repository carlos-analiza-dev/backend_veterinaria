import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductosAgroservicioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  descripcion?: string;

  @IsString()
  tipo: string;

  @IsNumber()
  precio: number;

  @IsString()
  @IsNotEmpty()
  unidadMedida: string;

  @IsBoolean()
  @IsOptional()
  disponible: boolean;
}
