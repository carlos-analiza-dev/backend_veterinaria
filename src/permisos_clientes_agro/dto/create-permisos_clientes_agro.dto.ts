import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreatePermisosClientesAgroDto {
  @IsString()
  @Length(1, 100)
  nombre: string;

  @IsString()
  @Length(1, 100)
  url: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  descripcion?: string;

  @IsString()
  @Length(1, 50)
  modulo: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
