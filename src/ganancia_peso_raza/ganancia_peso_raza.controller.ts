import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GananciaPesoRazaService } from './ganancia_peso_raza.service';
import { CreateGananciaPesoRazaDto } from './dto/create-ganancia_peso_raza.dto';
import { UpdateGananciaPesoRazaDto } from './dto/update-ganancia_peso_raza.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('ganancia-peso-raza')
export class GananciaPesoRazaController {
  constructor(
    private readonly gananciaPesoRazaService: GananciaPesoRazaService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createGananciaPesoRazaDto: CreateGananciaPesoRazaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.gananciaPesoRazaService.create(
      createGananciaPesoRazaDto,
      cliente,
    );
  }

  @Get()
  findAll() {
    return this.gananciaPesoRazaService.findAll();
  }

  @Get('ganadero')
  @AuthCliente()
  findByCliente(@GetCliente() cliente: Cliente) {
    return this.gananciaPesoRazaService.findByCliente(cliente);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gananciaPesoRazaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGananciaPesoRazaDto: UpdateGananciaPesoRazaDto,
  ) {
    return this.gananciaPesoRazaService.update(id, updateGananciaPesoRazaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gananciaPesoRazaService.remove(id);
  }
}
