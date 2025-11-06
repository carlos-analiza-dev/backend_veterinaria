import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProduccionAgricolaService } from './produccion_agricola.service';
import { CreateProduccionAgricolaDto } from './dto/create-produccion_agricola.dto';
import { UpdateProduccionAgricolaDto } from './dto/update-produccion_agricola.dto';

@Controller('produccion-agricola')
export class ProduccionAgricolaController {
  constructor(
    private readonly produccionAgricolaService: ProduccionAgricolaService,
  ) {}

  @Post()
  create(@Body() createProduccionAgricolaDto: CreateProduccionAgricolaDto) {
    return this.produccionAgricolaService.create(createProduccionAgricolaDto);
  }

  @Get()
  findAll() {
    return this.produccionAgricolaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionAgricolaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProduccionAgricolaDto: UpdateProduccionAgricolaDto,
  ) {
    return this.produccionAgricolaService.update(
      id,
      updateProduccionAgricolaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produccionAgricolaService.remove(id);
  }
}
