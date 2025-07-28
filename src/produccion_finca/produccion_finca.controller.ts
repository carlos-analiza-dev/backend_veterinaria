import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProduccionFincaService } from './produccion_finca.service';
import { CreateProduccionFincaDto } from './dto/create-produccion_finca.dto';
import { UpdateProduccionFincaDto } from './dto/update-produccion_finca.dto';

@Controller('produccion-finca')
export class ProduccionFincaController {
  constructor(
    private readonly produccionFincaService: ProduccionFincaService,
  ) {}

  @Post()
  create(@Body() createProduccionFincaDto: CreateProduccionFincaDto) {
    return this.produccionFincaService.create(createProduccionFincaDto);
  }

  @Get()
  findAll() {
    return this.produccionFincaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionFincaService.findOne(id);
  }

  @Get('propietario/:id')
  GetByUserId(@Param('id') id: string) {
    return this.produccionFincaService.GetByUserId(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProduccionFincaDto: UpdateProduccionFincaDto,
  ) {
    return this.produccionFincaService.update(id, updateProduccionFincaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produccionFincaService.remove(id);
  }
}
