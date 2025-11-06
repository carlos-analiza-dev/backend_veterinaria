import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProduccionForrajesInsumosService } from './produccion_forrajes_insumos.service';
import { CreateProduccionForrajesInsumoDto } from './dto/create-produccion_forrajes_insumo.dto';
import { UpdateProduccionForrajesInsumoDto } from './dto/update-produccion_forrajes_insumo.dto';

@Controller('produccion-forrajes-insumos')
export class ProduccionForrajesInsumosController {
  constructor(
    private readonly produccionForrajesInsumosService: ProduccionForrajesInsumosService,
  ) {}

  @Post()
  create(
    @Body()
    createProduccionForrajesInsumoDto: CreateProduccionForrajesInsumoDto,
  ) {
    return this.produccionForrajesInsumosService.create(
      createProduccionForrajesInsumoDto,
    );
  }

  @Get()
  findAll() {
    return this.produccionForrajesInsumosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionForrajesInsumosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateProduccionForrajesInsumoDto: UpdateProduccionForrajesInsumoDto,
  ) {
    return this.produccionForrajesInsumosService.update(
      id,
      updateProduccionForrajesInsumoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produccionForrajesInsumosService.remove(id);
  }
}
