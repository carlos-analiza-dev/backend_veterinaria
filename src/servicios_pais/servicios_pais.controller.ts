import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ServiciosPaisService } from './servicios_pais.service';
import { CreateServiciosPaiDto } from './dto/create-servicios_pai.dto';
import { UpdateServiciosPaiDto } from './dto/update-servicios_pai.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('servicios-pais')
export class ServiciosPaisController {
  constructor(private readonly serviciosPaisService: ServiciosPaisService) {}

  @Post()
  create(@Body() createServiciosPaiDto: CreateServiciosPaiDto) {
    return this.serviciosPaisService.create(createServiciosPaiDto);
  }

  @Get('/servicio/:servicioId')
  findAll(
    @Param('servicioId') servicioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.serviciosPaisService.findAll(servicioId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviciosPaisService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiciosPaiDto: UpdateServiciosPaiDto,
  ) {
    return this.serviciosPaisService.update(id, updateServiciosPaiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviciosPaisService.remove(id);
  }
}
