import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RolesPermisosAgroService } from './roles-permisos-agro.service';
import { CreateRolesPermisosAgroDto } from './dto/create-roles-permisos-agro.dto';
import { UpdateRolesPermisosAgroDto } from './dto/update-roles-permisos-agro.dto';

@Controller('roles-permisos-agro')
export class RolesPermisosAgroController {
  constructor(
    private readonly rolesPermisosAgroService: RolesPermisosAgroService,
  ) {}

  @Post()
  create(@Body() createRolesPermisosAgroDto: CreateRolesPermisosAgroDto) {
    return this.rolesPermisosAgroService.create(createRolesPermisosAgroDto);
  }

  @Get()
  findAll() {
    return this.rolesPermisosAgroService.findAll();
  }

  @Get('rol/:rolId')
  findAllByRol(@Param('rolId') rolId: string) {
    return this.rolesPermisosAgroService.findAllByRol(rolId);
  }

  @Get('not-rol/:rolId')
  findAllNotRol(@Param('rolId') rolId: string) {
    return this.rolesPermisosAgroService.findAllNotRol(rolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesPermisosAgroService.findOne(id);
  }

  @Patch('rol/:roleId')
  updatePermisosRol(
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRolesPermisosAgroDto,
  ) {
    return this.rolesPermisosAgroService.updatePermisosRol(roleId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesPermisosAgroService.remove(id);
  }
}
