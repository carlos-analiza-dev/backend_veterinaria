import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { TipoSucursal } from 'src/sucursales/entities/sucursal.entity';

export class CreateAgroSucursaleDto {
  @IsString({ message: 'El nombre de la sucursal debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio.' })
  @Length(3, 150, {
    message: 'El nombre de la sucursal debe tener entre 3 y 150 caracteres.',
  })
  nombre: string;

  @IsEnum(TipoSucursal, {
    message: 'El tipo de sucursal seleccionado no es válido.',
  })
  tipo: TipoSucursal;

  @IsOptional()
  @IsLatitude({
    message: 'La latitud debe ser un valor válido entre -90 y 90.',
  })
  latitud?: number;

  @IsOptional()
  @IsLongitude({
    message: 'La longitud debe ser un valor válido entre -180 y 180.',
  })
  longitud?: number;

  @IsString({
    message: 'La dirección complementaria debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'La dirección complementaria es obligatoria.',
  })
  @Length(5, 255, {
    message: 'La dirección complementaria debe tener entre 5 y 255 caracteres.',
  })
  direccion_complemento: string;

  @IsUUID('4', {
    message: 'El país seleccionado no es válido.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar un país.',
  })
  paisId: string;

  @IsUUID('4', {
    message: 'El departamento seleccionado no es válido.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar un departamento.',
  })
  departamentoId: string;

  @IsUUID('4', {
    message: 'El municipio seleccionado no es válido.',
  })
  @IsNotEmpty({
    message: 'Debe seleccionar un municipio.',
  })
  municipioId: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'El gerente seleccionado no es válido.',
  })
  gerenteId?: string;
}
