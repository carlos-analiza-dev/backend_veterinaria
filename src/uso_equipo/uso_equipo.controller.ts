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
import { UsoEquipoService } from './uso_equipo.service';
import { CreateUsoEquipoDto } from './dto/create-uso_equipo.dto';
import { UpdateUsoEquipoDto } from './dto/update-uso_equipo.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('uso-equipo')
export class UsoEquipoController {
  constructor(private readonly usoEquipoService: UsoEquipoService) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createUsoEquipoDto: CreateUsoEquipoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.usoEquipoService.create(createUsoEquipoDto, cliente);
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usoEquipoService.findAll(cliente, paginationDto);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string, @GetCliente() cliente: Cliente) {
    return this.usoEquipoService.findOne(id, cliente);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateUsoEquipoDto: UpdateUsoEquipoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.usoEquipoService.update(id, updateUsoEquipoDto, cliente);
  }
}
