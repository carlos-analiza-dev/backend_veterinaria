import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SanidadAnimalService } from './sanidad_animal.service';
import { CreateSanidadAnimalDto } from './dto/create-sanidad_animal.dto';
import { UpdateSanidadAnimalDto } from './dto/update-sanidad_animal.dto';

@Controller('sanidad-animal')
export class SanidadAnimalController {
  constructor(private readonly sanidadAnimalService: SanidadAnimalService) {}

  @Post()
  create(@Body() createSanidadAnimalDto: CreateSanidadAnimalDto) {
    return this.sanidadAnimalService.create(createSanidadAnimalDto);
  }

  @Get()
  findAll() {
    return this.sanidadAnimalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sanidadAnimalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSanidadAnimalDto: UpdateSanidadAnimalDto) {
    return this.sanidadAnimalService.update(+id, updateSanidadAnimalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sanidadAnimalService.remove(+id);
  }
}
