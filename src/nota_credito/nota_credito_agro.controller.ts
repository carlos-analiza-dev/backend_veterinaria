import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { NotaCreditoAgroService } from './nota_credito_agro.service';
import { CreateNotaCreditoDto } from './dto/create-nota_credito.dto';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Controller('nota-credito-agro')
export class NotaCreditoAgroController {
  constructor(private readonly notaCreditoService: NotaCreditoAgroService) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createNotaCreditoDto: CreateNotaCreditoDto,
  ) {
    return this.notaCreditoService.create(cliente, createNotaCreditoDto);
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @GetEmpleado() empleado: EmpleadosAgro,
    @Body() createNotaCreditoDto: CreateNotaCreditoDto,
  ) {
    return this.notaCreditoService.createEmpleado(
      empleado,
      createNotaCreditoDto,
    );
  }

  @Get('agroservicio/:propietarioId')
  findAll(
    @Param('propietarioId', ParseUUIDPipe) propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.notaCreditoService.findAll(propietarioId, paginationDto);
  }

  /* @Get()
  @Auth()
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.notaCreditoService.findAll(user, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notaCreditoService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notaCreditoService.remove(id);
  } */
}
