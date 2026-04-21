import { IsString, IsNotEmpty } from 'class-validator';

export class AnularPlanillaDto {
  @IsString()
  @IsNotEmpty()
  motivo: string;
}
