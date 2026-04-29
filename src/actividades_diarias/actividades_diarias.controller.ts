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
import { ActividadesDiariasService } from './actividades_diarias.service';
import { CreateActividadesDiariaDto } from './dto/create-actividades_diaria.dto';
import { UpdateActividadesDiariaDto } from './dto/update-actividades_diaria.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('actividades-diarias')
export class ActividadesDiariasController {
  constructor(
    private readonly actividadesDiariasService: ActividadesDiariasService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() propietario: Cliente,
    @Body() createActividadesDiariaDto: CreateActividadesDiariaDto,
  ) {
    return this.actividadesDiariasService.create(
      propietario,
      createActividadesDiariaDto,
    );
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.actividadesDiariasService.findAll(cliente, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesDiariasService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @GetCliente() cliente: Cliente,
    @Param('id') id: string,
    @Body() updateActividadesDiariaDto: UpdateActividadesDiariaDto,
  ) {
    return this.actividadesDiariasService.update(
      cliente,
      id,
      updateActividadesDiariaDto,
    );
  }

  @Delete(':id')
  @AuthCliente()
  remove(@GetCliente() cliente: Cliente, @Param('id') id: string) {
    return this.actividadesDiariasService.remove(cliente, id);
  }
}
