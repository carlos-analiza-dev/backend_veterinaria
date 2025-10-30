import { IsInt, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateDetallesNotaCreditoDto {
  @IsUUID('4', { message: 'El campo "producto_id" debe ser un UUID válido.' })
  producto_id: string;

  @IsInt({ message: 'El campo "cantidad" debe ser un número entero.' })
  @Min(1, { message: 'La cantidad mínima debe ser 1.' })
  cantidad: number;

  @IsNumber(
    {},
    { message: 'El campo "montoDevuelto" debe ser un número válido.' },
  )
  @IsPositive({ message: 'El campo "montoDevuelto" debe ser mayor que 0.' })
  montoDevuelto: number;
}
