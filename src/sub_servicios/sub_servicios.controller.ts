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
import { SubServiciosService } from './sub_servicios.service';
import { CreateSubServicioDto } from './dto/create-sub_servicio.dto';
import { UpdateSubServicioDto } from './dto/update-sub_servicio.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('sub-servicios')
export class SubServiciosController {
  constructor(private readonly subServiciosService: SubServiciosService) {}

  @Post()
  create(@Body() createSubServicioDto: CreateSubServicioDto) {
    return this.subServiciosService.create(createSubServicioDto);
  }

  @Get('productos')
  findAllProductos(@Query() paginationDto: PaginationDto) {
    return this.subServiciosService.findAllProductos(paginationDto);
  }

  @Get('servicio/:servicioId')
  findAll(@Param('servicioId') servicioId: string) {
    return this.subServiciosService.findAll(servicioId);
  }

  @Get('servicio-pais/:servicioId/:paisId/:cantidadAnimales')
  findAllPreciosCantidadAnimales(
    @Param('servicioId') servicioId: string,
    @Param('paisId') paisId: string,
    @Param('cantidadAnimales') cantidadAnimales: number,
  ) {
    return this.subServiciosService.findAllPreciosCantidadAnimales(
      servicioId,
      paisId,
      cantidadAnimales,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subServiciosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubServicioDto: UpdateSubServicioDto,
  ) {
    return this.subServiciosService.update(id, updateSubServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subServiciosService.remove(+id);
  }
}
