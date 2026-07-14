import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesAgroDto } from './create-roles-agro.dto';

export class UpdateRolesAgroDto extends PartialType(CreateRolesAgroDto) {}
