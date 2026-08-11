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
import { PermisosClientesAgroService } from './permisos_clientes_agro.service';
import { CreatePermisosClientesAgroDto } from './dto/create-permisos_clientes_agro.dto';
import { UpdatePermisosClientesAgroDto } from './dto/update-permisos_clientes_agro.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('permisos-clientes-agro')
export class PermisosClientesAgroController {
  constructor(
    private readonly permisosClientesAgroService: PermisosClientesAgroService,
  ) {}

  @Post()
  create(@Body() createPermisosClienteDto: CreatePermisosClientesAgroDto) {
    return this.permisosClientesAgroService.create(createPermisosClienteDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permisosClientesAgroService.findAll(paginationDto);
  }

  @Get('activos')
  @AuthCliente()
  findPermisosActivos(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.permisosClientesAgroService.findPermisosActivos(
      cliente,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permisosClientesAgroService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermisosClienteDto: UpdatePermisosClientesAgroDto,
  ) {
    return this.permisosClientesAgroService.update(
      id,
      updatePermisosClienteDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permisosClientesAgroService.remove(id);
  }
}
