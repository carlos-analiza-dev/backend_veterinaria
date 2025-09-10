import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DescuentosProductoService } from './descuentos_producto.service';
import { CreateDescuentosProductoDto } from './dto/create-descuentos_producto.dto';
import { UpdateDescuentosProductoDto } from './dto/update-descuentos_producto.dto';

@Controller('descuentos-producto')
export class DescuentosProductoController {
  constructor(
    private readonly descuentosProductoService: DescuentosProductoService,
  ) {}

  @Post()
  create(@Body() createDescuentosProductoDto: CreateDescuentosProductoDto) {
    return this.descuentosProductoService.create(createDescuentosProductoDto);
  }

  @Get()
  findAll() {
    return this.descuentosProductoService.findAll();
  }

  @Get('producto/:productoId')
  findDescuentoProducto(@Param('productoId') productoId: string) {
    return this.descuentosProductoService.findDescuentoProducto(productoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.descuentosProductoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDescuentosProductoDto: UpdateDescuentosProductoDto,
  ) {
    return this.descuentosProductoService.update(
      id,
      updateDescuentosProductoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.descuentosProductoService.remove(id);
  }
}
