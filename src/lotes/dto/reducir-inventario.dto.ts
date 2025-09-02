import { Transform } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class ReducirInventarioDto {
  @IsUUID('4', { message: 'El id_producto debe ser un UUID válido' })
  id_producto: string;

  @IsUUID('4', { message: 'El id_sucursal debe ser un UUID válido' })
  id_sucursal: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Transform(({ value }) => parseFloat(value))
  cantidad: number;
}