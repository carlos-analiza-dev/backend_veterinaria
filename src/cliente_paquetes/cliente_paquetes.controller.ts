import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ClientePaquetesService } from './cliente_paquetes.service';
import { CreateClientePaqueteDto } from './dto/create-cliente_paquete.dto';
import { UpdateClientePaqueteDto } from './dto/update-cliente_paquete.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('cliente-paquetes')
export class ClientePaquetesController {
  constructor(
    private readonly clientePaquetesService: ClientePaquetesService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createClientePaqueteDto: CreateClientePaqueteDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.clientePaquetesService.create(createClientePaqueteDto, cliente);
  }

  @Get()
  findAll() {
    return this.clientePaquetesService.findAll();
  }

  @Get('historial')
  @AuthCliente()
  findByClienteHistorial(@GetCliente() cliente: Cliente) {
    return this.clientePaquetesService.findByClienteHistorial(cliente);
  }

  @Get('cliente')
  @AuthCliente()
  findByCliente(@GetCliente() cliente: Cliente) {
    return this.clientePaquetesService.findByCliente(cliente);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientePaquetesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientePaqueteDto: UpdateClientePaqueteDto,
  ) {
    return this.clientePaquetesService.update(id, updateClientePaqueteDto);
  }
}
