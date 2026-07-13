import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DatosAgroservicioService } from './datos-agroservicio.service';
import { CreateDatosAgroservicioDto } from './dto/create-datos-agroservicio.dto';
import { UpdateDatosAgroservicioDto } from './dto/update-datos-agroservicio.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('datos-agroservicio')
export class DatosAgroservicioController {
  constructor(
    private readonly datosAgroservicioService: DatosAgroservicioService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createDatosAgroservicioDto: CreateDatosAgroservicioDto,
  ) {
    return this.datosAgroservicioService.create(
      cliente,
      createDatosAgroservicioDto,
    );
  }

  @Get()
  @AuthCliente()
  findAll(@GetCliente() cliente: Cliente) {
    return this.datosAgroservicioService.findAll(cliente);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.datosAgroservicioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDatosAgroservicioDto: UpdateDatosAgroservicioDto,
  ) {
    return this.datosAgroservicioService.update(id, updateDatosAgroservicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.datosAgroservicioService.remove(id);
  }
}
