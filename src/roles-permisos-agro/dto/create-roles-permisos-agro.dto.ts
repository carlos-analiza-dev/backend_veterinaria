import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class CreateRolesPermisosAgroDto {
  @IsUUID()
  roleId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  permisosIds: string[];
}
