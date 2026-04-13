import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProduccionFincaService } from './produccion_finca.service';
import { CreateProduccionFincaDto } from './dto/create-produccion_finca.dto';
import { UpdateProduccionFincaDto } from './dto/update-produccion_finca.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('produccion-finca')
export class ProduccionFincaController {
  constructor(
    private readonly produccionFincaService: ProduccionFincaService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createProduccionFincaDto: CreateProduccionFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.produccionFincaService.create(
      createProduccionFincaDto,
      cliente,
    );
  }

  @Get('propietario')
  @AuthCliente()
  GetByUserId(@GetCliente() cliente: Cliente) {
    return this.produccionFincaService.GetByUserId(cliente);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionFincaService.findOne(id);
  }

  @Get()
  findAll() {
    return this.produccionFincaService.findAll();
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateProduccionFincaDto: UpdateProduccionFincaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.produccionFincaService.update(
      id,
      updateProduccionFincaDto,
      cliente,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produccionFincaService.remove(id);
  }
}
