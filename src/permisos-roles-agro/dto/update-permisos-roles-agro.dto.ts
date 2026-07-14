import { PartialType } from '@nestjs/mapped-types';
import { CreatePermisosRolesAgroDto } from './create-permisos-roles-agro.dto';

export class UpdatePermisosRolesAgroDto extends PartialType(CreatePermisosRolesAgroDto) {}
