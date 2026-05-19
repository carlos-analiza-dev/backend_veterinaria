import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePaquetePermisoDto {
  @IsOptional()
  @IsBoolean()
  ver?: boolean;

  @IsOptional()
  @IsBoolean()
  crear?: boolean;

  @IsOptional()
  @IsBoolean()
  editar?: boolean;

  @IsOptional()
  @IsBoolean()
  eliminar?: boolean;
}
