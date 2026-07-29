import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgroFacturacionService } from './agro_facturacion.service';
import { CreateAgroFacturacionDto } from './dto/create-agro_facturacion.dto';
import { UpdateAgroFacturacionDto } from './dto/update-agro_facturacion.dto';

@Controller('agro-facturacion')
export class AgroFacturacionController {
  constructor(private readonly agroFacturacionService: AgroFacturacionService) {}

  @Post()
  create(@Body() createAgroFacturacionDto: CreateAgroFacturacionDto) {
    return this.agroFacturacionService.create(createAgroFacturacionDto);
  }

  @Get()
  findAll() {
    return this.agroFacturacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agroFacturacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgroFacturacionDto: UpdateAgroFacturacionDto) {
    return this.agroFacturacionService.update(+id, updateAgroFacturacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agroFacturacionService.remove(+id);
  }
}
