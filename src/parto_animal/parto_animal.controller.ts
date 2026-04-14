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
import { PartoAnimalService } from './parto_animal.service';
import { CreatePartoAnimalDto } from './dto/create-parto_animal.dto';
import { UpdatePartoAnimalDto } from './dto/update-parto_animal.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { FiltrarPartosDto } from './dto/filtrar-partos.dto';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('parto-animal')
export class PartoAnimalController {
  constructor(private readonly partoAnimalService: PartoAnimalService) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createPartoAnimalDto: CreatePartoAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.partoAnimalService.create(createPartoAnimalDto, cliente);
  }

  @Get()
  @AuthCliente()
  findAll(@Query() filtros: FiltrarPartosDto) {
    return this.partoAnimalService.findAll(filtros);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string) {
    return this.partoAnimalService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updatePartoAnimalDto: UpdatePartoAnimalDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.partoAnimalService.update(id, updatePartoAnimalDto, cliente);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partoAnimalService.remove(+id);
  }
}
