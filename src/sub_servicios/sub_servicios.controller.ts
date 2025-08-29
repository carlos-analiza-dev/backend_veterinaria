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

import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Controller('sub-servicios')
export class SubServiciosController {
  constructor(private readonly subServiciosService: SubServiciosService) {}

  @Post('servicio')
  createServicio(@Body() createServicioDto: CreateServicioDto) {
    return this.subServiciosService.createServicio(createServicioDto);
  }

  @Post('producto')
  createProducto(@Body() createProductoDto: CreateProductoDto) {
    return this.subServiciosService.createProducto(createProductoDto);
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

  @Patch('servicio/:id')
  updateServicio(
    @Param('id') id: string,
    @Body() updateServicioDto: UpdateServicioDto,
  ) {
    return this.subServiciosService.updateServicio(id, updateServicioDto);
  }

  @Patch('producto/:id')
  updateProducto(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.subServiciosService.updateProducto(id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subServiciosService.remove(+id);
  }
}
