import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePesoHistorialDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  peso: number;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;

  @IsUUID()
  animalId: string;
}
