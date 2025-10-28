import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateHistorialDetalleDto } from './dto/create-historial_detalle.dto';
import { UpdateHistorialDetalleDto } from './dto/update-historial_detalle.dto';
import { HistorialDetalleService } from './historial_detalles.service';

@Controller('historial-detalles')
export class HistorialDetallesController {
  constructor(
    private readonly historialDetallesService: HistorialDetalleService,
  ) {}

  @Post()
  create(@Body() createHistorialDetalleDto: CreateHistorialDetalleDto) {
    return this.historialDetallesService.create(createHistorialDetalleDto);
  }

  @Get()
  findAll() {
    return this.historialDetallesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialDetallesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHistorialDetalleDto: UpdateHistorialDetalleDto,
  ) {
    return this.historialDetallesService.update(id, updateHistorialDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialDetallesService.remove(id);
  }
}
