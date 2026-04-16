import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EspecieAnimalService } from './especie_animal.service';
import { CreateEspecieAnimalDto } from './dto/create-especie_animal.dto';
import { UpdateEspecieAnimalDto } from './dto/update-especie_animal.dto';

@Controller('especie-animal')
export class EspecieAnimalController {
  constructor(private readonly especieAnimalService: EspecieAnimalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateEspecieAnimalDto) {
    return this.especieAnimalService.create(createDto);
  }

  @Get()
  findAll() {
    return this.especieAnimalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.especieAnimalService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateEspecieAnimalDto) {
    return this.especieAnimalService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.especieAnimalService.remove(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.especieAnimalService.restore(id);
  }
}
