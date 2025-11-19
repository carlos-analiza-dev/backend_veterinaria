import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientePermisosService } from './cliente_permisos.service';
import { CreateClientePermisoDto } from './dto/create-cliente_permiso.dto';
import { UpdateClientePermisoDto } from './dto/update-cliente_permiso.dto';

@Controller('cliente-permisos')
export class ClientePermisosController {
  constructor(
    private readonly clientePermisosService: ClientePermisosService,
  ) {}

  @Post()
  create(@Body() createClientePermisoDto: CreateClientePermisoDto) {
    return this.clientePermisosService.create(createClientePermisoDto);
  }

  @Get()
  findAll() {
    return this.clientePermisosService.findAll();
  }

  @Get(':id')
  findByCliente(@Param('id') id: string) {
    return this.clientePermisosService.findByCliente(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientePermisoDto: UpdateClientePermisoDto,
  ) {
    return this.clientePermisosService.update(id, updateClientePermisoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientePermisosService.remove(id);
  }
}
