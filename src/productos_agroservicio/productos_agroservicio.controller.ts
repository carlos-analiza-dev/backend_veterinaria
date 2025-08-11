import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductosAgroservicioService } from './productos_agroservicio.service';
import { CreateProductosAgroservicioDto } from './dto/create-productos_agroservicio.dto';
import { UpdateProductosAgroservicioDto } from './dto/update-productos_agroservicio.dto';

@Controller('productos-agroservicio')
export class ProductosAgroservicioController {
  constructor(
    private readonly productosAgroservicioService: ProductosAgroservicioService,
  ) {}

  @Post()
  create(@Body() createproductoDto: CreateProductosAgroservicioDto) {
    return this.productosAgroservicioService.create(createproductoDto);
  }

  @Get()
  findAll() {
    return this.productosAgroservicioService.findAll();
  }

  @Get('productos-disponibles')
  findproductosDisponibles() {
    return this.productosAgroservicioService.findproductosDisponibles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosAgroservicioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateproductoDto: UpdateProductosAgroservicioDto,
  ) {
    return this.productosAgroservicioService.update(id, updateproductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosAgroservicioService.remove(id);
  }
}
