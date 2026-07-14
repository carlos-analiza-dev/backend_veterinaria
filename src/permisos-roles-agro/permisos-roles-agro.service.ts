import { Injectable } from '@nestjs/common';
import { CreatePermisosRolesAgroDto } from './dto/create-permisos-roles-agro.dto';
import { UpdatePermisosRolesAgroDto } from './dto/update-permisos-roles-agro.dto';

@Injectable()
export class PermisosRolesAgroService {
  create(createPermisosRolesAgroDto: CreatePermisosRolesAgroDto) {
    return 'This action adds a new permisosRolesAgro';
  }

  findAll() {
    return `This action returns all permisosRolesAgro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} permisosRolesAgro`;
  }

  update(id: number, updatePermisosRolesAgroDto: UpdatePermisosRolesAgroDto) {
    return `This action updates a #${id} permisosRolesAgro`;
  }

  remove(id: number) {
    return `This action removes a #${id} permisosRolesAgro`;
  }
}
