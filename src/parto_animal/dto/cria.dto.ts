import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoCria, SexoCria } from 'src/interfaces/partos.enums';

export class CriaDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsEnum(SexoCria)
  sexo: SexoCria;

  @IsNumber()
  @Min(0)
  @Max(100)
  peso: number;

  @IsEnum(EstadoCria)
  estado: EstadoCria;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  identificador?: string;

  @Type(() => Date)
  @IsDate()
  fecha_nacimiento: Date;
}
