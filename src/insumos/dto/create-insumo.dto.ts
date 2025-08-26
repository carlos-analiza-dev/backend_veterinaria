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
import { UnidadVenta } from '../entities/insumo.entity';

export class CreateInsumoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100, { message: 'El nombre no debe superar los 100 caracteres.' })
  nombre: string;

  @IsString({ message: 'El código debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @MaxLength(20, { message: 'El código no debe superar los 20 caracteres.' })
  codigo: string;

  @IsNumber({}, { message: 'El costo debe ser un número válido.' })
  @Min(0, { message: 'El costo no puede ser negativo.' })
  costo: number;

  @IsEnum(UnidadVenta, {
    message: `La unidad de venta debe ser uno de los siguientes valores: ${Object.values(
      UnidadVenta,
    ).join(', ')}`,
  })
  @IsOptional()
  unidad_venta?: UnidadVenta;

  @IsBoolean({ message: 'Disponible debe ser un valor booleano.' })
  @IsOptional()
  disponible?: boolean;

  @IsUUID('4', { message: 'El ID de la marca debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La marca del insumo es obligatoria' })
  marcaId: string;

  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El proveedor del insumo es obligatoria' })
  proveedorId: string;

  @IsUUID('4', { message: 'El ID del pais debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El pais del insumo es obligatoria' })
  paisId?: string;
}
