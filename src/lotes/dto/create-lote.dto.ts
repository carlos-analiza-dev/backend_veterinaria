import { Transform } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class CreateLoteDto {
  @IsUUID()
  id_compra: string;

  @IsUUID()
  id_sucursal: string;

  @IsUUID()
  id_producto: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  costo: number;
}