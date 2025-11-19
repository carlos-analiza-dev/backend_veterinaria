import {
  IsString,
  IsOptional,
  IsBoolean,
  Length,
  IsEnum,
} from 'class-validator';

export class CreatePermisosClienteDto {
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
