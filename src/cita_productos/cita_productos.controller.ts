import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CitaProductosService } from './cita_productos.service';
import { CreateCitaProductoDto } from './dto/create-cita_producto.dto';
import { UpdateCitaProductoDto } from './dto/update-cita_producto.dto';

@Controller('cita-productos')
export class CitaProductosController {
  constructor(private readonly citaProductosService: CitaProductosService) {}

  @Post()
  create(@Body() createCitaProductoDto: CreateCitaProductoDto) {
    return this.citaProductosService.create(createCitaProductoDto);
  }

  @Get('cita/:citaId')
  findAllByCita(@Param('citaId') citaId: string) {
    return this.citaProductosService.findAllByCita(citaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citaProductosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCitaProductoDto: UpdateCitaProductoDto,
  ) {
    return this.citaProductosService.update(id, updateCitaProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citaProductosService.remove(id);
  }
}
