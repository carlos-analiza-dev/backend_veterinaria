import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClienteFincaTrabajadorService } from './cliente_finca_trabajador.service';
import { CreateClienteFincaTrabajadorDto } from './dto/create-cliente_finca_trabajador.dto';
import { UpdateClienteFincaTrabajadorDto } from './dto/update-cliente_finca_trabajador.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('cliente-finca-trabajador')
export class ClienteFincaTrabajadorController {
  constructor(
    private readonly clienteFincaTrabajadorService: ClienteFincaTrabajadorService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createClienteFincaTrabajadorDto: CreateClienteFincaTrabajadorDto,
    @GetCliente() propietario: Cliente,
  ) {
    return this.clienteFincaTrabajadorService.create(
      createClienteFincaTrabajadorDto,
      propietario,
    );
  }

  @Get()
  @AuthCliente()
  findAll() {
    return this.clienteFincaTrabajadorService.findAll();
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string) {
    return this.clienteFincaTrabajadorService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateClienteFincaTrabajadorDto: UpdateClienteFincaTrabajadorDto,
  ) {
    return this.clienteFincaTrabajadorService.update(
      id,
      updateClienteFincaTrabajadorDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteFincaTrabajadorService.remove(+id);
  }
}
