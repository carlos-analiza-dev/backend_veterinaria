import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PermisosRolesAgroService } from './permisos-roles-agro.service';
import { CreatePermisosRolesAgroDto } from './dto/create-permisos-roles-agro.dto';
import { UpdatePermisosRolesAgroDto } from './dto/update-permisos-roles-agro.dto';

@Controller('permisos-roles-agro')
export class PermisosRolesAgroController {
  constructor(private readonly permisosRolesAgroService: PermisosRolesAgroService) {}

  @Post()
  create(@Body() createPermisosRolesAgroDto: CreatePermisosRolesAgroDto) {
    return this.permisosRolesAgroService.create(createPermisosRolesAgroDto);
  }

  @Get()
  findAll() {
    return this.permisosRolesAgroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permisosRolesAgroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermisosRolesAgroDto: UpdatePermisosRolesAgroDto) {
    return this.permisosRolesAgroService.update(+id, updatePermisosRolesAgroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permisosRolesAgroService.remove(+id);
  }
}
