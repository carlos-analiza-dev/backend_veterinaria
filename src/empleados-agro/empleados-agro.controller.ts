import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadosAgroService } from './empleados-agro.service';
import { CreateEmpleadosAgroDto } from './dto/create-empleados-agro.dto';
import { UpdateEmpleadosAgroDto } from './dto/update-empleados-agro.dto';

@Controller('empleados-agro')
export class EmpleadosAgroController {
  constructor(private readonly empleadosAgroService: EmpleadosAgroService) {}

  @Post()
  create(@Body() createEmpleadosAgroDto: CreateEmpleadosAgroDto) {
    return this.empleadosAgroService.create(createEmpleadosAgroDto);
  }

  @Get()
  findAll() {
    return this.empleadosAgroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadosAgroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadosAgroDto: UpdateEmpleadosAgroDto) {
    return this.empleadosAgroService.update(+id, updateEmpleadosAgroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadosAgroService.remove(+id);
  }
}
