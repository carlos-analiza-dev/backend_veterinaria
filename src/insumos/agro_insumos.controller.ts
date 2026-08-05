import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AgroInsumosService } from './agro_insumos.service';
import { CreateAgroInsumoDto } from './dto/create-agro-insumo.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { UpdateAgroInsumoDto } from './dto/update-insumo.dto';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Controller('agro_insumos')
export class AgroInsumosController {
  constructor(private readonly insumosService: AgroInsumosService) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createInsumoDto: CreateAgroInsumoDto,
  ) {
    return this.insumosService.create(cliente, createInsumoDto);
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() createInsumoDto: CreateAgroInsumoDto,
  ) {
    return this.insumosService.createEmpleado(empleado, createInsumoDto);
  }

  @Get('insumos/:propietarioId')
  findAll(
    @Param('propietarioId') propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.insumosService.findAll(propietarioId, paginationDto);
  }

  @Get('insumos-disponibles/:propietarioId')
  findInsumosDisponibles(@Param('propietarioId') propietarioId: string) {
    return this.insumosService.findInsumosDisponibles(propietarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.insumosService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @GetCliente() cliente: Cliente,
    @Body() updateInsumoDto: UpdateAgroInsumoDto,
  ) {
    return this.insumosService.update(id, cliente, updateInsumoDto);
  }

  @Patch('empleado/:id')
  @AuthEmpleado()
  updateEmpleado(
    @Param('id') id: string,
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() updateInsumoDto: UpdateAgroInsumoDto,
  ) {
    return this.insumosService.updateEmpleado(id, empleado, updateInsumoDto);
  }
}
