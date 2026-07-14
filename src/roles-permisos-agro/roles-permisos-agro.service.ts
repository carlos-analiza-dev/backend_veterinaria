import { Injectable } from '@nestjs/common';
import { CreateRolesPermisosAgroDto } from './dto/create-roles-permisos-agro.dto';
import { UpdateRolesPermisosAgroDto } from './dto/update-roles-permisos-agro.dto';

@Injectable()
export class RolesPermisosAgroService {
  create(createRolesPermisosAgroDto: CreateRolesPermisosAgroDto) {
    return 'This action adds a new rolesPermisosAgro';
  }

  findAll() {
    return `This action returns all rolesPermisosAgro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rolesPermisosAgro`;
  }

  update(id: number, updateRolesPermisosAgroDto: UpdateRolesPermisosAgroDto) {
    return `This action updates a #${id} rolesPermisosAgro`;
  }

  remove(id: number) {
    return `This action removes a #${id} rolesPermisosAgro`;
  }
}
