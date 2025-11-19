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
import { PermisosClientesService } from './permisos_clientes.service';
import { CreatePermisosClienteDto } from './dto/create-permisos_cliente.dto';
import { UpdatePermisosClienteDto } from './dto/update-permisos_cliente.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('permisos-clientes')
export class PermisosClientesController {
  constructor(
    private readonly permisosClientesService: PermisosClientesService,
  ) {}

  @Post()
  create(@Body() createPermisosClienteDto: CreatePermisosClienteDto) {
    return this.permisosClientesService.create(createPermisosClienteDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permisosClientesService.findAll(paginationDto);
  }

  @Get('activos')
  findPermisosActivos() {
    return this.permisosClientesService.findPermisosActivos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permisosClientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermisosClienteDto: UpdatePermisosClienteDto,
  ) {
    return this.permisosClientesService.update(id, updatePermisosClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permisosClientesService.remove(id);
  }
}
