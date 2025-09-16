import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthClientesService } from './auth-clientes.service';
import { CreateAuthClienteDto } from './dto/create-auth-cliente.dto';
import { UpdateAuthClienteDto } from './dto/update-auth-cliente.dto';
import { AuthCliente } from './decorators/auth-cliente.decorator';
import { GetCliente } from './decorators/get-cliente.decorator';
import { Cliente } from './entities/auth-cliente.entity';

@Controller('auth-clientes')
export class AuthClientesController {
  constructor(private readonly authClientesService: AuthClientesService) {}

  @Post()
  create(@Body() createAuthClienteDto: CreateAuthClienteDto) {
    return this.authClientesService.create(createAuthClienteDto);
  }

  @Get()
  @AuthCliente()
  findAll(@GetCliente() cliente: Cliente) {
    return this.authClientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authClientesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuthClienteDto: UpdateAuthClienteDto,
  ) {
    return this.authClientesService.update(+id, updateAuthClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authClientesService.remove(+id);
  }
}
