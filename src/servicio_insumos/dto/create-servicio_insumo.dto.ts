import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateServicioInsumoDto {
  @IsUUID('4', { message: 'El campo "servicioId" debe ser un UUID válido.' })
  servicioId: string;

  @IsUUID('4', { message: 'El campo "insumoId" debe ser un UUID válido.' })
  insumoId: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La cantidad debe ser un número con máximo 2 decimales.' },
  )
  @Min(0.01, { message: 'La cantidad mínima permitida es 0.01.' })
  @IsOptional()
  cantidad?: number = 1;
}
