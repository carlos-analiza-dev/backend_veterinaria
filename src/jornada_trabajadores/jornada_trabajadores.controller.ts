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
import { JornadaTrabajadoresService } from './jornada_trabajadores.service';
import { CreateJornadaTrabajadoreDto } from './dto/create-jornada_trabajadore.dto';
import { UpdateJornadaTrabajadoreDto } from './dto/update-jornada_trabajadore.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('jornada-trabajadores')
export class JornadaTrabajadoresController {
  constructor(
    private readonly jornadaTrabajadoresService: JornadaTrabajadoresService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() propietario: Cliente,
    @Body() createJornadaTrabajadoreDto: CreateJornadaTrabajadoreDto,
  ) {
    return this.jornadaTrabajadoresService.create(
      propietario,
      createJornadaTrabajadoreDto,
    );
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() propietatio: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.jornadaTrabajadoresService.findAll(propietatio, paginationDto);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string, @GetCliente() propietatio: Cliente) {
    return this.jornadaTrabajadoresService.findOne(id, propietatio);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @GetCliente() propietario: Cliente,
    @Body() updateJornadaTrabajadoreDto: UpdateJornadaTrabajadoreDto,
  ) {
    return this.jornadaTrabajadoresService.update(
      id,
      propietario,
      updateJornadaTrabajadoreDto,
    );
  }
}
