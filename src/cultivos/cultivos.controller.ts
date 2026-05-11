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
import { CultivosService } from './cultivos.service';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('cultivos')
export class CultivosController {
  constructor(private readonly cultivosService: CultivosService) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createCultivoDto: CreateCultivoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.cultivosService.create(createCultivoDto, cliente);
  }

  @Get()
  @AuthCliente()
  findAll(
    @Query() paginationDto: PaginationDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.cultivosService.findAll(paginationDto, cliente);
  }

  @Get('estadisticas/resumen')
  @AuthCliente()
  async getEstadisticas(
    @GetCliente() cliente: Cliente,
    @Query('fincaId') fincaId?: string,
  ) {
    return this.cultivosService.getEstadisticas(cliente, fincaId);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string, @GetCliente() cliente: Cliente) {
    return this.cultivosService.findOne(id, cliente);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateCultivoDto: UpdateCultivoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.cultivosService.update(id, updateCultivoDto, cliente);
  }
}
