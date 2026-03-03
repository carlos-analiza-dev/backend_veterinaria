import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PesoHistorialService } from './peso_historial.service';
import { CreatePesoHistorialDto } from './dto/create-peso_historial.dto';
import { UpdatePesoHistorialDto } from './dto/update-peso_historial.dto';

@Controller('peso-historial')
export class PesoHistorialController {
  constructor(private readonly pesoHistorialService: PesoHistorialService) {}

  @Post()
  create(@Body() createPesoHistorialDto: CreatePesoHistorialDto) {
    return this.pesoHistorialService.create(createPesoHistorialDto);
  }

  @Get()
  findAll() {
    return this.pesoHistorialService.findAll();
  }

  @Get('animal/:id')
  findAllPesoByAnimal(@Param('id') id: string) {
    return this.pesoHistorialService.findAllPesoByAnimal(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pesoHistorialService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePesoHistorialDto: UpdatePesoHistorialDto,
  ) {
    return this.pesoHistorialService.update(id, updatePesoHistorialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pesoHistorialService.remove(id);
  }
}
