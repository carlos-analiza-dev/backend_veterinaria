import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateAgroFacturaDetalleDto {
  @IsUUID()
  id_producto: string;

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
