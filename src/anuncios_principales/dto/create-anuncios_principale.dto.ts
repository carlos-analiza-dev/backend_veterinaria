import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { EtiquetaAnuncio } from '../entities/anuncios_principale.entity';
import { Transform } from 'class-transformer';

export class CreateAnunciosPrincipaleDto {
  @IsString({
    message: 'El título es obligatorio',
  })
  titulo: string;

  @IsString({
    message: 'La descripción es obligatoria',
  })
  descripcion: string;

  @IsString({
    message: 'El enlace es obligatorio',
  })
  link: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({
    message: 'El campo esPrincipal debe ser verdadero o falso',
  })
  esPrincipal?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({
    message: 'El campo mostrar debe ser verdadero o falso',
  })
  mostrar?: boolean;

  @IsOptional()
  @IsEnum(EtiquetaAnuncio, {
    message: 'La etiqueta seleccionada no es válida',
  })
  etiqueta?: EtiquetaAnuncio;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de inicio debe tener un formato válido',
    },
  )
  fechaInicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de fin debe tener un formato válido',
    },
  )
  fechaFin?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    return [value];
  })
  @IsArray()
  @IsString({ each: true })
  imagenesAEliminar?: string[];
}
