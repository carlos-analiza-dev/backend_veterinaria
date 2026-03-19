import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetallesServicioReproductivoService } from './detalles_servicio_reproductivo.service';
import { CreateDetallesServicioReproductivoDto } from './dto/create-detalles_servicio_reproductivo.dto';
import { UpdateDetallesServicioReproductivoDto } from './dto/update-detalles_servicio_reproductivo.dto';

@Controller('detalles-servicio-reproductivo')
export class DetallesServicioReproductivoController {
  constructor(private readonly detallesServicioReproductivoService: DetallesServicioReproductivoService) {}

  @Post()
  create(@Body() createDetallesServicioReproductivoDto: CreateDetallesServicioReproductivoDto) {
    return this.detallesServicioReproductivoService.create(createDetallesServicioReproductivoDto);
  }

  @Get()
  findAll() {
    return this.detallesServicioReproductivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detallesServicioReproductivoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetallesServicioReproductivoDto: UpdateDetallesServicioReproductivoDto) {
    return this.detallesServicioReproductivoService.update(+id, updateDetallesServicioReproductivoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detallesServicioReproductivoService.remove(+id);
  }
}
