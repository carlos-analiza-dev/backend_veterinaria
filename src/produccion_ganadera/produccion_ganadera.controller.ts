import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProduccionGanaderaService } from './produccion_ganadera.service';

import { UpdateProduccionGanaderaDto } from './dto/update-produccion_ganadera.dto';
import { ProduccionGanaderaDto } from './dto/create-produccion_ganadera.dto';

@Controller('produccion-ganadera')
export class ProduccionGanaderaController {
  constructor(
    private readonly produccionGanaderaService: ProduccionGanaderaService,
  ) {}

  @Post()
  create(@Body() createProduccionGanaderaDto: ProduccionGanaderaDto) {
    return this.produccionGanaderaService.create(createProduccionGanaderaDto);
  }

  @Get()
  findAll() {
    return this.produccionGanaderaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionGanaderaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProduccionGanaderaDto: UpdateProduccionGanaderaDto,
  ) {
    return this.produccionGanaderaService.update(
      id,
      updateProduccionGanaderaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produccionGanaderaService.remove(id);
  }
}
