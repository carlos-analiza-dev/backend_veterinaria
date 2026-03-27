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

@Controller('parto-animal')
export class PartoAnimalController {
  constructor(private readonly partoAnimalService: PartoAnimalService) {}

  @Post()
  @AuthCliente()
  create(@Body() createPartoAnimalDto: CreatePartoAnimalDto) {
    return this.partoAnimalService.create(createPartoAnimalDto);
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
  update(
    @Param('id') id: string,
    @Body() updatePartoAnimalDto: UpdatePartoAnimalDto,
  ) {
    return this.partoAnimalService.update(id, updatePartoAnimalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partoAnimalService.remove(+id);
  }
}
