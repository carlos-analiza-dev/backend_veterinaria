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
import { MantenimientoEquipoService } from './mantenimiento_equipo.service';
import { CreateMantenimientoEquipoDto } from './dto/create-mantenimiento_equipo.dto';
import { UpdateMantenimientoEquipoDto } from './dto/update-mantenimiento_equipo.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('mantenimiento-equipo')
export class MantenimientoEquipoController {
  constructor(
    private readonly mantenimientoEquipoService: MantenimientoEquipoService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createMantenimientoEquipoDto: CreateMantenimientoEquipoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.mantenimientoEquipoService.create(
      createMantenimientoEquipoDto,
      cliente,
    );
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.mantenimientoEquipoService.findAll(cliente, paginationDto);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string, @GetCliente() cliente: Cliente) {
    return this.mantenimientoEquipoService.findOne(id, cliente);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateMantenimientoEquipoDto: UpdateMantenimientoEquipoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.mantenimientoEquipoService.update(
      id,
      updateMantenimientoEquipoDto,
      cliente,
    );
  }
}
