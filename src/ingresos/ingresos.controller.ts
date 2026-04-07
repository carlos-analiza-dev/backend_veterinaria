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
import { IngresosService } from './ingresos.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('ingresos')
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createIngresoDto: CreateIngresoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.ingresosService.create(createIngresoDto, cliente);
  }

  @Get()
  @AuthCliente()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ingresosService.findAll(paginationDto);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string) {
    return this.ingresosService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateIngresoDto: UpdateIngresoDto,
    @GetUser() cliente: Cliente,
  ) {
    return this.ingresosService.update(id, updateIngresoDto, cliente);
  }
}
