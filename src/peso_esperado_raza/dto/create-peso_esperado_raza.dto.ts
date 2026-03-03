import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePesoEsperadoRazaDto {
  @IsInt()
  @Min(0)
  edadMinMeses: number;

  @IsInt()
  @Min(0)
  edadMaxMeses: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pesoEsperadoMin: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pesoEsperadoMax: number;

  @IsUUID()
  razaId: string;
}
