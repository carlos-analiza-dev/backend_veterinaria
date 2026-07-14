import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RolesAgroService } from './roles-agro.service';
import { CreateRolesAgroDto } from './dto/create-roles-agro.dto';
import { UpdateRolesAgroDto } from './dto/update-roles-agro.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('roles-agro')
export class RolesAgroController {
  constructor(private readonly rolesAgroService: RolesAgroService) {}

  @Post()
  create(@Body() createRoleDto: CreateRolesAgroDto) {
    return this.rolesAgroService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.rolesAgroService.findAll();
  }

  @Get('/filters')
  findAllPagiante(@Query() paginationDto: PaginationDto) {
    return this.rolesAgroService.findAllPaginate(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesAgroService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRolesAgroDto) {
    return this.rolesAgroService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesAgroService.remove(+id);
  }
}
