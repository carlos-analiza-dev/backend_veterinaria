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
import { ConfiguracionTrabajadoresService } from './configuracion_trabajadores.service';
import { CreateConfiguracionTrabajadoreDto } from './dto/create-configuracion_trabajadore.dto';
import { UpdateConfiguracionTrabajadoreDto } from './dto/update-configuracion_trabajadore.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('configuracion-trabajadores')
export class ConfiguracionTrabajadoresController {
  constructor(
    private readonly configuracionTrabajadoresService: ConfiguracionTrabajadoresService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() propietario: Cliente,
    @Body()
    createConfiguracionTrabajadoreDto: CreateConfiguracionTrabajadoreDto,
  ) {
    return this.configuracionTrabajadoresService.create(
      propietario,
      createConfiguracionTrabajadoreDto,
    );
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.configuracionTrabajadoresService.findAll(
      cliente,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configuracionTrabajadoresService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @GetCliente() propietario: Cliente,
    @Body()
    updateConfiguracionTrabajadoreDto: UpdateConfiguracionTrabajadoreDto,
  ) {
    return this.configuracionTrabajadoresService.update(
      id,
      propietario,
      updateConfiguracionTrabajadoreDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configuracionTrabajadoresService.remove(+id);
  }
}
