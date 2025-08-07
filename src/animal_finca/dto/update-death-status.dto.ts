import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDeathStatusDto {
  @IsBoolean()
  animal_muerte: boolean;

  @IsString()
  @IsOptional()
  razon_muerte?: string;
}
