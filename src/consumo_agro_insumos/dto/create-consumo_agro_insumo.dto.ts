import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateConsumoAgroInsumoDto {
  @IsNumber()
  @IsPositive()
  cantidad: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_consumo: Date;

  @IsOptional()
  @IsString()
  observacion?: string;
}
