import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateGananciaPesoRazaDto {
  @IsUUID()
  razaId: string;

  @IsNumber()
  @Min(0, { message: 'La ganancia mínima por día no puede ser negativa' })
  @Max(3, { message: 'La ganancia mínima por día no puede exceder 3 lb' })
  @Type(() => Number)
  gananciaMinima: number;

  @IsNumber()
  @Min(0, { message: 'La ganancia máxima por día no puede ser negativa' })
  @Max(3, { message: 'La ganancia máxima por día no puede exceder 3 lb' })
  @Type(() => Number)
  gananciaMaxima: number;
}
