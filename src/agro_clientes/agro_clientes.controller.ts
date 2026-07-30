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
import { AgroClientesService } from './agro_clientes.service';
import { CreateAgroClienteDto } from './dto/create-agro_cliente.dto';
import { UpdateAgroClienteDto } from './dto/update-agro_cliente.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('agro-clientes')
export class AgroClientesController {
  constructor(private readonly agroClientesService: AgroClientesService) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createAgroClienteDto: CreateAgroClienteDto,
  ) {
    return this.agroClientesService.create(cliente, createAgroClienteDto);
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() createAgroClienteDto: CreateAgroClienteDto,
  ) {
    return this.agroClientesService.createEmpleado(
      empleado,
      createAgroClienteDto,
    );
  }

  @Get('agroservicio/:propietarioId')
  findAll(
    @Param('propietarioId') propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroClientesService.findAll(propietarioId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroClientesService.findOne(+id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @GetCliente() cliente: Cliente,
    @Body() updateAgroClienteDto: UpdateAgroClienteDto,
  ) {
    return this.agroClientesService.update(id, cliente, updateAgroClienteDto);
  }

  @Patch('empleado/:id')
  @AuthEmpleado()
  updateEmpleado(
    @Param('id') id: string,
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() updateAgroClienteDto: UpdateAgroClienteDto,
  ) {
    return this.agroClientesService.updateEmpleado(
      id,
      empleado,
      updateAgroClienteDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agroClientesService.remove(+id);
  }
}
