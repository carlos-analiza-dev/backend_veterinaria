import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PartoAnimalService } from './parto_animal.service';
import { CreatePartoAnimalDto } from './dto/create-parto_animal.dto';
import { UpdatePartoAnimalDto } from './dto/update-parto_animal.dto';

@Controller('parto-animal')
export class PartoAnimalController {
  constructor(private readonly partoAnimalService: PartoAnimalService) {}

  @Post()
  create(@Body() createPartoAnimalDto: CreatePartoAnimalDto) {
    return this.partoAnimalService.create(createPartoAnimalDto);
  }

  @Get()
  findAll() {
    return this.partoAnimalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partoAnimalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartoAnimalDto: UpdatePartoAnimalDto) {
    return this.partoAnimalService.update(+id, updatePartoAnimalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partoAnimalService.remove(+id);
  }
}
