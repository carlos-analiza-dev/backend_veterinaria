import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesPermisosAgroDto } from './create-roles-permisos-agro.dto';

export class UpdateRolesPermisosAgroDto extends PartialType(CreateRolesPermisosAgroDto) {}
