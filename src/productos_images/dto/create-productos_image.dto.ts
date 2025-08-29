import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProductosImageDto {
  @IsString({ message: 'La URL debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La URL es obligatoria.' })
  @MaxLength(255, { message: 'La URL no debe exceder 255 caracteres.' })
  url: string;

  @IsString({ message: 'La clave debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'La clave no debe exceder 255 caracteres.' })
  key?: string;

  @IsString({ message: 'El mimeType debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El mimeType es obligatorio.' })
  @MaxLength(100, { message: 'El mimeType no debe exceder 100 caracteres.' })
  mimeType: string;

  @IsUUID('4', { message: 'El producto_id debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El producto_id es obligatorio.' })
  productoId: string;
}
