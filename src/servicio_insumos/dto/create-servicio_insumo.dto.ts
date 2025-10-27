import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateServicioInsumoDto {
  @IsUUID('4', {
    message: 'El campo "servicioPaisId" debe ser un UUID válido.',
  })
  @IsOptional()
  servicioPaisId?: string;

  @IsUUID('4', { message: 'El campo "insumoId" debe ser un UUID válido.' })
  insumoId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número válido.' })
  @Min(1, { message: 'La cantidad mínima permitida es 1.' })
  @Transform(({ value }) => (value === undefined ? 1 : value))
  cantidad?: number;
}
