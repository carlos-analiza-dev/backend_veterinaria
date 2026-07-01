import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateAnimalFromCriaDto {
  @IsUUID()
  @IsNotEmpty()
  partoId: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  criaIndex: number;

  @IsUUID()
  @IsNotEmpty()
  hembraId: string;

  @IsUUID()
  @IsNotEmpty()
  fincaId: string;

  @IsString()
  @IsNotEmpty()
  identificador: string;

  @IsString()
  @IsNotEmpty()
  sexo: string;

  @IsOptional()
  @IsString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsNumber()
  peso?: number;
}
