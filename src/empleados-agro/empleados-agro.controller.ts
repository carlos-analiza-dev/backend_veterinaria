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
import { EmpleadosAgroService } from './empleados-agro.service';
import { CreateEmpleadosAgroDto } from './dto/create-empleados-agro.dto';
import { UpdateEmpleadosAgroDto } from './dto/update-empleados-agro.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { LoginEmpleadoDto } from './dto/login-empleado.dto';
import { AuthEmpleado } from './decorators/auth-empleado.decorator';
import { GetEmpleado } from './decorators/get-empleado.decorator';
import { EmpleadosAgro } from './entities/empleados-agro.entity';

@Controller('empleados-agro')
export class EmpleadosAgroController {
  constructor(private readonly empleadosAgroService: EmpleadosAgroService) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createEmpleadosAgroDto: CreateEmpleadosAgroDto,
  ) {
    return this.empleadosAgroService.create(createEmpleadosAgroDto, cliente);
  }

  @Post('login')
  loginUser(@Body() loginEmpleadoDto: LoginEmpleadoDto) {
    return this.empleadosAgroService.login(loginEmpleadoDto);
  }

  @Get('check-status')
  @AuthEmpleado()
  checkAuthStatus(@GetEmpleado() empleadoAgro: EmpleadosAgro) {
    return this.empleadosAgroService.checkAuthStatus(empleadoAgro);
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.empleadosAgroService.findAll(cliente, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadosAgroService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmpleadosAgroDto: UpdateEmpleadosAgroDto,
  ) {
    return this.empleadosAgroService.update(id, updateEmpleadosAgroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadosAgroService.remove(+id);
  }
}
