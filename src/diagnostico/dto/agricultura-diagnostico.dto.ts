import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateConsultaAgricolaDto {
  @IsString()
  cultivo: string;

  @IsOptional()
  @IsString()
  tipoSuelo?: string;

  @IsOptional()
  @IsString()
  clima?: string;

  @IsArray()
  problemas: string[];
}
