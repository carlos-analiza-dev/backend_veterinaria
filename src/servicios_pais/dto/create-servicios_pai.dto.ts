import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateServicioInsumoDto } from 'src/servicio_insumos/dto/create-servicio_insumo.dto';

export class CreateServiciosPaiDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del servicio es obligatorio.' })
  sub_servicio_id: string;

  @IsNumber()
  @Min(1, { message: 'El precio no debe ser menor o igual a cero' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  precio: number;

  @IsNumber()
  @Min(1, { message: 'El costo no debe ser menor o igual a cero' })
  @IsOptional()
  costo?: number;

  @IsNumber({}, { message: 'El tiempo debe ser un número.' })
  tiempo?: number;

  @IsNumber({}, { message: 'La cantidad mínima debe ser un número.' })
  cantidadMin?: number;

  @IsNumber({}, { message: 'La cantidad máxima debe ser un número.' })
  cantidadMax?: number;

  @IsUUID()
  paisId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServicioInsumoDto)
  insumos?: CreateServicioInsumoDto[];
}
