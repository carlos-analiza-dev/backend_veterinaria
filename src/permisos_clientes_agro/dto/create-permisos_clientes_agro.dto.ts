import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TipoAgroservicio } from 'src/interfaces/paquetes/paquetes.enum';

export class CreatePermisosClientesAgroDto {
  @IsString()
  @Length(1, 100)
  nombre: string;

  @IsEnum(TipoAgroservicio, {
    message: 'El tipo de agroservicio no es válido',
  })
  tipo: TipoAgroservicio;

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
