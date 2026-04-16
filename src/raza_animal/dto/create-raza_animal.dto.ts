import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateRazaAnimalDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  abreviatura?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  especieId: string;
}
