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
import { GastosService } from './gastos.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createGastoDto: CreateGastoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.gastosService.create(createGastoDto, cliente);
  }

  @Get()
  @AuthCliente()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.gastosService.findAll(paginationDto);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string) {
    return this.gastosService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateGastoDto: UpdateGastoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.gastosService.update(id, updateGastoDto, cliente);
  }
}
