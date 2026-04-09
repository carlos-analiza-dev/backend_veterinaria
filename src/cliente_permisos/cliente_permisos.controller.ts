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
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

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

  @Get('propietario')
  @AuthCliente()
  findAllByPropietario(@GetCliente() propietario: Cliente) {
    return this.clientePermisosService.findAllByPropietario(propietario);
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
