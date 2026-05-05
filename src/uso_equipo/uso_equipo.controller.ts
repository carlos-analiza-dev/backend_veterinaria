import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsoEquipoService } from './uso_equipo.service';
import { CreateUsoEquipoDto } from './dto/create-uso_equipo.dto';
import { UpdateUsoEquipoDto } from './dto/update-uso_equipo.dto';

@Controller('uso-equipo')
export class UsoEquipoController {
  constructor(private readonly usoEquipoService: UsoEquipoService) {}

  @Post()
  create(@Body() createUsoEquipoDto: CreateUsoEquipoDto) {
    return this.usoEquipoService.create(createUsoEquipoDto);
  }

  @Get()
  findAll() {
    return this.usoEquipoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usoEquipoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsoEquipoDto: UpdateUsoEquipoDto) {
    return this.usoEquipoService.update(+id, updateUsoEquipoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usoEquipoService.remove(+id);
  }
}
