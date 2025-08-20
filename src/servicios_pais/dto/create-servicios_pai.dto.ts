import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateServiciosPaiDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del servicio es obligatorio.' })
  sub_servicio_id: string;

  @IsNumber()
  @Min(1, { message: 'El precio no debe ser menor o igual a cero' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  precio: number;

  @IsNumber({}, { message: 'El tiempo debe ser un número.' })
  tiempo?: number;

  @IsNumber({}, { message: 'La cantidad mínima debe ser un número.' })
  cantidadMin?: number;

  @IsNumber({}, { message: 'La cantidad máxima debe ser un número.' })
  cantidadMax?: number;

  @IsUUID()
  paisId: string;
}
