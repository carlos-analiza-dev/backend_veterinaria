import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductoRatingResumenService } from './producto_rating_resumen.service';
import { CreateProductoRatingResumanDto } from './dto/create-producto_rating_resuman.dto';
import { UpdateProductoRatingResumanDto } from './dto/update-producto_rating_resuman.dto';

@Controller('producto-rating-resumen')
export class ProductoRatingResumenController {
  constructor(
    private readonly productoRatingResumenService: ProductoRatingResumenService,
  ) {}

  @Post()
  create(
    @Body() createProductoRatingResumanDto: CreateProductoRatingResumanDto,
  ) {
    return this.productoRatingResumenService.create(
      createProductoRatingResumanDto,
    );
  }

  @Get()
  findAll() {
    return this.productoRatingResumenService.findAll();
  }

  @Get('producto/:id')
  findByProducto(@Param('id') id: string) {
    return this.productoRatingResumenService.findByProductoId(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoRatingResumanDto: UpdateProductoRatingResumanDto,
  ) {
    return this.productoRatingResumenService.update(
      +id,
      updateProductoRatingResumanDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoRatingResumenService.remove(+id);
  }
}
