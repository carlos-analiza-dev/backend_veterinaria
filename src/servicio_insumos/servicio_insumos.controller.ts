import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ServicioInsumosService } from './servicio_insumos.service';
import { CreateServicioInsumoDto } from './dto/create-servicio_insumo.dto';
import { UpdateServicioInsumoDto } from './dto/update-servicio_insumo.dto';

@Controller('servicio-insumos')
export class ServicioInsumosController {
  constructor(
    private readonly servicioInsumosService: ServicioInsumosService,
  ) {}

  @Post()
  create(@Body() createServicioInsumoDto: CreateServicioInsumoDto) {
    return this.servicioInsumosService.create(createServicioInsumoDto);
  }

  @Get()
  findAll() {
    return this.servicioInsumosService.findAll();
  }

  @Get('servicio/:id')
  findAllByServicio(@Param('id') id: string) {
    return this.servicioInsumosService.findAllByServicio(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicioInsumosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServicioInsumoDto: UpdateServicioInsumoDto,
  ) {
    return this.servicioInsumosService.update(id, updateServicioInsumoDto);
  }
}
