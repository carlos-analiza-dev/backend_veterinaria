import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PesoEsperadoRazaService } from './peso_esperado_raza.service';
import { CreatePesoEsperadoRazaDto } from './dto/create-peso_esperado_raza.dto';
import { UpdatePesoEsperadoRazaDto } from './dto/update-peso_esperado_raza.dto';
import { CalcularRangoPesoDto } from './dto/calcular-rango-peso';

@Controller('peso-esperado-raza')
export class PesoEsperadoRazaController {
  constructor(
    private readonly pesoEsperadoRazaService: PesoEsperadoRazaService,
  ) {}

  @Post()
  create(@Body() createPesoEsperadoRazaDto: CreatePesoEsperadoRazaDto) {
    return this.pesoEsperadoRazaService.create(createPesoEsperadoRazaDto);
  }

  @Post('calcular-rango')
  calcularRango(@Body() dto: CalcularRangoPesoDto) {
    return this.pesoEsperadoRazaService.calcularRangoPeso(dto);
  }

  @Get()
  findAll() {
    return this.pesoEsperadoRazaService.findAll();
  }

  @Get('raza/:razaId')
  findByRaza(@Param('razaId') razaId: string) {
    return this.pesoEsperadoRazaService.findByRaza(razaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pesoEsperadoRazaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePesoEsperadoRazaDto: UpdatePesoEsperadoRazaDto,
  ) {
    return this.pesoEsperadoRazaService.update(id, updatePesoEsperadoRazaDto);
  }
}
