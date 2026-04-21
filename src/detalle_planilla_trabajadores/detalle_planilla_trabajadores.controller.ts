import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetallePlanillaTrabajadoresService } from './detalle_planilla_trabajadores.service';
import { CreateDetallePlanillaTrabajadoreDto } from './dto/create-detalle_planilla_trabajadore.dto';
import { UpdateDetallePlanillaTrabajadoreDto } from './dto/update-detalle_planilla_trabajadore.dto';

@Controller('detalle-planilla-trabajadores')
export class DetallePlanillaTrabajadoresController {
  constructor(private readonly detallePlanillaTrabajadoresService: DetallePlanillaTrabajadoresService) {}

  @Post()
  create(@Body() createDetallePlanillaTrabajadoreDto: CreateDetallePlanillaTrabajadoreDto) {
    return this.detallePlanillaTrabajadoresService.create(createDetallePlanillaTrabajadoreDto);
  }

  @Get()
  findAll() {
    return this.detallePlanillaTrabajadoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detallePlanillaTrabajadoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetallePlanillaTrabajadoreDto: UpdateDetallePlanillaTrabajadoreDto) {
    return this.detallePlanillaTrabajadoresService.update(+id, updateDetallePlanillaTrabajadoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detallePlanillaTrabajadoresService.remove(+id);
  }
}
