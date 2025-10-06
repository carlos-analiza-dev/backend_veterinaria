import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateFacturaDetalleDto {
  @IsUUID()
  id_producto_servicio: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @IsPositive()
  precio: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  total: number;
}
