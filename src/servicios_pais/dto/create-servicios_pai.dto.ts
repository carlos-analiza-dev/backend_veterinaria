import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateServiciosPaiDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del servicio es obligatorio.' })
  sub_servicio_id: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID del país es obligatorio.' })
  paisId: string;

  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor o igual a 0.' })
  precio: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El tiempo debe ser un número positivo.' })
  tiempo?: number;

  @IsNumber()
  @Min(0, { message: 'La cantidad minima debe ser un número positivo.' })
  @IsNotEmpty({ message: 'La cantidad minima no debe ser vacio' })
  cantidadMin: number;

  @IsNumber()
  @Min(0, { message: 'La cantidad minima debe ser un número positivo.' })
  @IsOptional()
  cantidadMax: number;
}
