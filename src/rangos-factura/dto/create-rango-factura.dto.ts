import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';

export class CreateRangoFacturaDto {
  @IsString()
  @IsNotEmpty()
  cai: string;

  @IsString()
  @IsNotEmpty()
  prefijo: string;

  @IsNumber()
  @Min(1)
  rango_inicial: number;

  @IsNumber()
  @Min(1)
  rango_final: number;

  @IsDateString()
  fecha_recepcion: Date;

  @IsDateString()
  fecha_limite_emision: Date;

  @IsArray()
  @IsOptional()
  facturas_anuladas?: number[];
}