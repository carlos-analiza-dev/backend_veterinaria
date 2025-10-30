import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetallesNotaCreditoService } from './detalles_nota_credito.service';
import { CreateDetallesNotaCreditoDto } from './dto/create-detalles_nota_credito.dto';
import { UpdateDetallesNotaCreditoDto } from './dto/update-detalles_nota_credito.dto';

@Controller('detalles-nota-credito')
export class DetallesNotaCreditoController {
  constructor(private readonly detallesNotaCreditoService: DetallesNotaCreditoService) {}

  @Post()
  create(@Body() createDetallesNotaCreditoDto: CreateDetallesNotaCreditoDto) {
    return this.detallesNotaCreditoService.create(createDetallesNotaCreditoDto);
  }

  @Get()
  findAll() {
    return this.detallesNotaCreditoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detallesNotaCreditoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetallesNotaCreditoDto: UpdateDetallesNotaCreditoDto) {
    return this.detallesNotaCreditoService.update(+id, updateDetallesNotaCreditoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detallesNotaCreditoService.remove(+id);
  }
}
