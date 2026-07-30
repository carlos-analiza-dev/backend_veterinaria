import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateDescuentosAgroClienteDto } from './dto/create-descuentos-agro-cliente.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { DescuentosAgroClientesService } from './descuentos-agro-clientes.service';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { UpdateDescuentosAgroClienteDto } from './dto/update-descuentos_cliente.dto';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Controller('descuentos-agro-clientes')
export class DescuentosAgroClientesController {
  constructor(
    private readonly descuentosClientesService: DescuentosAgroClientesService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createDescuentosClienteDto: CreateDescuentosAgroClienteDto,
  ) {
    return this.descuentosClientesService.create(
      cliente,
      createDescuentosClienteDto,
    );
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() createDescuentosClienteDto: CreateDescuentosAgroClienteDto,
  ) {
    return this.descuentosClientesService.createEmpleado(
      empleado,
      createDescuentosClienteDto,
    );
  }

  @Get('agroservicio/:propietarioId')
  findAll(@Param('propietarioId', ParseUUIDPipe) propietarioId: string) {
    return this.descuentosClientesService.findAll(propietarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.descuentosClientesService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @GetCliente() cliente: Cliente,
    @Body() updateDescuentosClienteDto: UpdateDescuentosAgroClienteDto,
  ) {
    return this.descuentosClientesService.update(
      id,
      cliente,
      updateDescuentosClienteDto,
    );
  }

  @Patch('empleado/:id')
  @AuthEmpleado()
  updateEmpleado(
    @Param('id') id: string,
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() updateDescuentosClienteDto: UpdateDescuentosAgroClienteDto,
  ) {
    return this.descuentosClientesService.updateEmpleado(
      id,
      empleado,
      updateDescuentosClienteDto,
    );
  }
}
