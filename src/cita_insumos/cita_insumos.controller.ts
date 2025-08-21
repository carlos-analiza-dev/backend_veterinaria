import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CitaInsumosService } from './cita_insumos.service';
import { CreateCitaInsumoDto } from './dto/create-cita_insumo.dto';
import { UpdateCitaInsumoDto } from './dto/update-cita_insumo.dto';

@Controller('cita-insumos')
export class CitaInsumosController {
  constructor(private readonly citaInsumosService: CitaInsumosService) {}

  @Post()
  create(@Body() createCitaInsumoDto: CreateCitaInsumoDto) {
    return this.citaInsumosService.create(createCitaInsumoDto);
  }

  @Get('cita/:citaId')
  findAllByCita(@Param('citaId') citaId: string) {
    return this.citaInsumosService.findAllByCita(citaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citaInsumosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCitaInsumoDto: UpdateCitaInsumoDto,
  ) {
    return this.citaInsumosService.update(id, updateCitaInsumoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citaInsumosService.remove(id);
  }
}
