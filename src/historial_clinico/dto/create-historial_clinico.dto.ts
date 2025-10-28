import {
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetalleDto {
  @IsOptional()
  @IsUUID('4', { message: 'subServicioId debe ser un UUID válido (v4).' })
  subServicioId?: string;

  @IsOptional()
  @IsString({ message: 'diagnostico debe ser una cadena de texto.' })
  diagnostico?: string;

  @IsOptional()
  @IsString({ message: 'tratamiento debe ser una cadena de texto.' })
  tratamiento?: string;

  @IsOptional()
  @IsString({ message: 'observaciones debe ser una cadena de texto.' })
  observaciones?: string;
}

export class CreateHistorialClinicoDto {
  @IsUUID('4', {
    message: 'animalId es obligatorio y debe ser un UUID válido (v4).',
  })
  animalId: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'citaId debe ser un UUID válido (v4) si se proporciona.',
  })
  citaId?: string;

  @IsOptional()
  @IsString({ message: 'resumen debe ser una cadena de texto.' })
  resumen?: string;

  @IsOptional()
  @IsArray({ message: 'detalles debe ser un arreglo de objetos.' })
  @ValidateNested({
    each: true,
    message: 'Cada elemento en detalles debe ser un objeto válido.',
  })
  @Type(() => CreateDetalleDto)
  detalles?: CreateDetalleDto[];
}
