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
import { EquipoMaquinariaService } from './equipo_maquinaria.service';
import { CreateEquipoMaquinariaDto } from './dto/create-equipo_maquinaria.dto';
import { UpdateEquipoMaquinariaDto } from './dto/update-equipo_maquinaria.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { EstadoMaquinaria } from 'src/interfaces/maquinaria/maquinaria.enums';

@Controller('equipo-maquinaria')
export class EquipoMaquinariaController {
  constructor(
    private readonly equipoMaquinariaService: EquipoMaquinariaService,
  ) {}

  @Post()
  create(@Body() createEquipoMaquinariaDto: CreateEquipoMaquinariaDto) {
    return this.equipoMaquinariaService.create(createEquipoMaquinariaDto);
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.equipoMaquinariaService.findAll(cliente, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipoMaquinariaService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateEquipoMaquinariaDto: UpdateEquipoMaquinariaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.equipoMaquinariaService.update(
      id,
      updateEquipoMaquinariaDto,
      cliente,
    );
  }

  @Patch(':id/estado/:estado')
  @AuthCliente()
  cambiarEstado(
    @Param('id') id: string,
    @Param('estado') estado: EstadoMaquinaria,
    @GetCliente() cliente: Cliente,
  ) {
    return this.equipoMaquinariaService.cambiarEstado(id, estado, cliente);
  }
}
