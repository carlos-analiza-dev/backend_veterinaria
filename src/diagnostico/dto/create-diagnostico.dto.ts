import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateDiagnosticoDto {
  @IsString()
  especie: string;
  @IsString()
  raza: string;
  @IsNumber()
  edad: number;
  @IsArray()
  sintomas: string[];
}
