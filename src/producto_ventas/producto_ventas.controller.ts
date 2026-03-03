import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductoVentasService } from './producto_ventas.service';
import { CreateProductoVentaDto } from './dto/create-producto_venta.dto';
import { UpdateProductoVentaDto } from './dto/update-producto_venta.dto';

@Controller('producto-ventas')
export class ProductoVentasController {
  constructor(private readonly productoVentasService: ProductoVentasService) {}

  @Post()
  create(@Body() createProductoVentaDto: CreateProductoVentaDto) {
    return this.productoVentasService.create(createProductoVentaDto);
  }

  @Get()
  findAll() {
    return this.productoVentasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoVentasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoVentaDto: UpdateProductoVentaDto,
  ) {
    return this.productoVentasService.update(id, updateProductoVentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoVentasService.remove(id);
  }
}
