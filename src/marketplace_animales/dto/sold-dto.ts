import { IsBoolean } from 'class-validator';

export class MarkSoldDto {
  @IsBoolean()
  vendido: boolean;

  @IsBoolean()
  disponible: boolean;
}
