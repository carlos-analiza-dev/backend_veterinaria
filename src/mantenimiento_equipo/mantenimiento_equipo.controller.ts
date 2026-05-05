import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MantenimientoEquipoService } from './mantenimiento_equipo.service';
import { CreateMantenimientoEquipoDto } from './dto/create-mantenimiento_equipo.dto';
import { UpdateMantenimientoEquipoDto } from './dto/update-mantenimiento_equipo.dto';

@Controller('mantenimiento-equipo')
export class MantenimientoEquipoController {
  constructor(private readonly mantenimientoEquipoService: MantenimientoEquipoService) {}

  @Post()
  create(@Body() createMantenimientoEquipoDto: CreateMantenimientoEquipoDto) {
    return this.mantenimientoEquipoService.create(createMantenimientoEquipoDto);
  }

  @Get()
  findAll() {
    return this.mantenimientoEquipoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mantenimientoEquipoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMantenimientoEquipoDto: UpdateMantenimientoEquipoDto) {
    return this.mantenimientoEquipoService.update(+id, updateMantenimientoEquipoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mantenimientoEquipoService.remove(+id);
  }
}
