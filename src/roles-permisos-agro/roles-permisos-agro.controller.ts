import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesPermisosAgroService } from './roles-permisos-agro.service';
import { CreateRolesPermisosAgroDto } from './dto/create-roles-permisos-agro.dto';
import { UpdateRolesPermisosAgroDto } from './dto/update-roles-permisos-agro.dto';

@Controller('roles-permisos-agro')
export class RolesPermisosAgroController {
  constructor(private readonly rolesPermisosAgroService: RolesPermisosAgroService) {}

  @Post()
  create(@Body() createRolesPermisosAgroDto: CreateRolesPermisosAgroDto) {
    return this.rolesPermisosAgroService.create(createRolesPermisosAgroDto);
  }

  @Get()
  findAll() {
    return this.rolesPermisosAgroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesPermisosAgroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRolesPermisosAgroDto: UpdateRolesPermisosAgroDto) {
    return this.rolesPermisosAgroService.update(+id, updateRolesPermisosAgroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesPermisosAgroService.remove(+id);
  }
}
