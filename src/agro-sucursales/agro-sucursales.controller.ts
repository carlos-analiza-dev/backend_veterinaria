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
import { AgroSucursalesService } from './agro-sucursales.service';
import { CreateAgroSucursaleDto } from './dto/create-agro-sucursale.dto';
import { UpdateAgroSucursaleDto } from './dto/update-agro-sucursale.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Controller('agro-sucursales')
export class AgroSucursalesController {
  constructor(private readonly agroSucursalesService: AgroSucursalesService) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createAgroSucursaleDto: CreateAgroSucursaleDto,
  ) {
    return this.agroSucursalesService.create(cliente, createAgroSucursaleDto);
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroSucursalesService.findAll(cliente, paginationDto);
  }

  @Get('sucursales')
  @AuthCliente()
  findTodas(@GetCliente() cliente: Cliente) {
    return this.agroSucursalesService.findTodas(cliente);
  }

  @Get('empleado')
  @AuthEmpleado()
  findOneEmpleado(@GetEmpleado() empleado: EmpleadosAgro) {
    return this.agroSucursalesService.findOneEmpleado(empleado);
  }

  @Get('sucursales/empleado/:propietarioId')
  findByPropietario(@Param('propietarioId') propietarioId: string) {
    return this.agroSucursalesService.findByPropietario(propietarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroSucursalesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgroSucursaleDto: UpdateAgroSucursaleDto,
  ) {
    return this.agroSucursalesService.update(id, updateAgroSucursaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agroSucursalesService.remove(id);
  }
}
