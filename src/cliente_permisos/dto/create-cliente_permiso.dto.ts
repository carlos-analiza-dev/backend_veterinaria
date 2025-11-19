import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateClientePermisoDto {
  @IsUUID()
  clienteId: string;

  @IsUUID()
  permisoId: string;

  @IsBoolean()
  @IsOptional()
  ver?: boolean;

  @IsBoolean()
  @IsOptional()
  crear?: boolean;

  @IsBoolean()
  @IsOptional()
  editar?: boolean;

  @IsBoolean()
  @IsOptional()
  eliminar?: boolean;
}
