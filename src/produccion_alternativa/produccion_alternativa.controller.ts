import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProduccionAlternativaService } from './produccion_alternativa.service';
import { CreateProduccionAlternativaDto } from './dto/create-produccion_alternativa.dto';
import { UpdateProduccionAlternativaDto } from './dto/update-produccion_alternativa.dto';

@Controller('produccion-alternativa')
export class ProduccionAlternativaController {
  constructor(
    private readonly produccionAlternativaService: ProduccionAlternativaService,
  ) {}

  @Post()
  create(
    @Body() createProduccionAlternativaDto: CreateProduccionAlternativaDto,
  ) {
    return this.produccionAlternativaService.create(
      createProduccionAlternativaDto,
    );
  }

  @Get()
  findAll() {
    return this.produccionAlternativaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionAlternativaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProduccionAlternativaDto: UpdateProduccionAlternativaDto,
  ) {
    return this.produccionAlternativaService.update(
      id,
      updateProduccionAlternativaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produccionAlternativaService.remove(id);
  }
}
