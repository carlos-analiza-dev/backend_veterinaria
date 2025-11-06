import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProduccionApiculturaService } from './produccion_apicultura.service';
import { CreateProduccionApiculturaDto } from './dto/create-produccion_apicultura.dto';
import { UpdateProduccionApiculturaDto } from './dto/update-produccion_apicultura.dto';

@Controller('produccion-apicultura')
export class ProduccionApiculturaController {
  constructor(
    private readonly produccionApiculturaService: ProduccionApiculturaService,
  ) {}

  @Post()
  create(@Body() createProduccionApiculturaDto: CreateProduccionApiculturaDto) {
    return this.produccionApiculturaService.create(
      createProduccionApiculturaDto,
    );
  }

  @Get()
  findAll() {
    return this.produccionApiculturaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionApiculturaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProduccionApiculturaDto: UpdateProduccionApiculturaDto,
  ) {
    return this.produccionApiculturaService.update(
      id,
      updateProduccionApiculturaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produccionApiculturaService.remove(id);
  }
}
