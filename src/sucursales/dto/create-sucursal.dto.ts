import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TipoSucursal } from '../entities/sucursal.entity';

export class CreateSucursalDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la sucursal es requerido' })
  nombre: string;

  @IsEnum(TipoSucursal, {
    message: 'El tipo debe ser: bodega, casa_matriz o sucursal',
  })
  @IsNotEmpty({ message: 'El tipo de sucursal es requerido' })
  tipo: TipoSucursal;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  direccion_complemento: string;

  @IsUUID('4', { message: 'El ID del municipio debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El municipio es requerido' })
  municipioId: string;

  @IsUUID('4', { message: 'El ID del departamento debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El departamento es requerido' })
  departamentoId: string;

  @IsUUID('4', { message: 'El ID del gerente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El gerente es requerido' })
  gerenteId: string;
}
