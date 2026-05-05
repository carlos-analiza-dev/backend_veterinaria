import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConsumoEquipoService } from './consumo_equipo.service';
import { CreateConsumoEquipoDto } from './dto/create-consumo_equipo.dto';
import { UpdateConsumoEquipoDto } from './dto/update-consumo_equipo.dto';

@Controller('consumo-equipo')
export class ConsumoEquipoController {
  constructor(private readonly consumoEquipoService: ConsumoEquipoService) {}

  @Post()
  create(@Body() createConsumoEquipoDto: CreateConsumoEquipoDto) {
    return this.consumoEquipoService.create(createConsumoEquipoDto);
  }

  @Get()
  findAll() {
    return this.consumoEquipoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumoEquipoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsumoEquipoDto: UpdateConsumoEquipoDto) {
    return this.consumoEquipoService.update(+id, updateConsumoEquipoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumoEquipoService.remove(+id);
  }
}
