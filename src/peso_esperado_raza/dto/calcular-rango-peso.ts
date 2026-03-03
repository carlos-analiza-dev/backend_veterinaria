import { IsInt, IsUUID, Min } from 'class-validator';

export class CalcularRangoPesoDto {
  @IsUUID()
  animalId: string;

  @IsInt()
  @Min(0)
  edadMeses: number;
}
