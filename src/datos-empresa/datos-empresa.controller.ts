import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DatosEmpresaService } from './datos-empresa.service';
import { CreateDatosEmpresaDto } from './dto/create-datos-empresa.dto';
import { UpdateDatosEmpresaDto } from './dto/update-datos-empresa.dto';

@Controller('datos-empresa')
export class DatosEmpresaController {
  constructor(private readonly datosEmpresaService: DatosEmpresaService) {}

  @Post()
  create(@Body() createDatosEmpresaDto: CreateDatosEmpresaDto) {
    return this.datosEmpresaService.create(createDatosEmpresaDto);
  }

  @Get()
  findOne() {
    return this.datosEmpresaService.findOne();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDatosEmpresaDto: UpdateDatosEmpresaDto,
  ) {
    return this.datosEmpresaService.update(+id, updateDatosEmpresaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.datosEmpresaService.remove(+id);
  }
}
