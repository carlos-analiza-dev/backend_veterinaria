import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PaquetePaisService } from './paquete_pais.service';
import { CreatePaquetePaiDto } from './dto/create-paquete_pai.dto';
import { UpdatePaquetePaiDto } from './dto/update-paquete_pai.dto';

@Controller('paquete-pais')
export class PaquetePaisController {
  constructor(private readonly paquetePaisService: PaquetePaisService) {}

  @Post()
  create(@Body() createPaquetePaiDto: CreatePaquetePaiDto) {
    return this.paquetePaisService.create(createPaquetePaiDto);
  }

  @Get()
  findAll() {
    return this.paquetePaisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paquetePaisService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaquetePaiDto: UpdatePaquetePaiDto,
  ) {
    return this.paquetePaisService.update(id, updatePaquetePaiDto);
  }
}
