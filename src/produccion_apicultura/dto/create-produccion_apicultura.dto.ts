import {
  IsUUID,
  IsInt,
  Min,
  IsString,
  IsIn,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateProduccionApiculturaDto {
  @IsInt({ message: 'El número de colmenas debe ser un entero' })
  @Min(1, { message: 'Debe haber al menos una colmena' })
  @IsOptional()
  numero_colmenas?: number;

  @IsString({ message: 'La frecuencia de cosecha debe ser un texto' })
  @IsOptional()
  frecuencia_cosecha?: string;

  @IsNumber({}, { message: 'La cantidad por cosecha debe ser numérica' })
  @Min(0.1, { message: 'Debe especificar una cantidad válida' })
  @IsOptional()
  cantidad_por_cosecha?: number;

  @IsString({ message: 'La calidad de miel debe ser texto' })
  @IsIn(['Oscura', 'Clara', 'Multifloral'], {
    message: 'La calidad debe ser Oscura, Clara o Multifloral',
  })
  @IsOptional()
  calidad_miel?: 'Oscura' | 'Clara' | 'Multifloral';
}
