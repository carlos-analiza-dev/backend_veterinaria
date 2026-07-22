import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateDescuentosAgroProductoDto } from './dto/create-descuento-agro-producto.dto';
import { UpdateAgroDescuentoProductoDto } from './dto/update-descuentos-agro-producto.dto';
import { DescuentoAgroProductoService } from './descuentos-agro-productos.service';

@Controller('descuentos-agro-producto')
export class DescuentosProductoController {
  constructor(
    private readonly descuentosProductoService: DescuentoAgroProductoService,
  ) {}

  @Post()
  create(@Body() createDescuentosProductoDto: CreateDescuentosAgroProductoDto) {
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

  @Get('proveedor/:proveedorId/producto/:productoId')
  findByProveedorAndProducto(
    @Param('proveedorId') proveedorId: string,
    @Param('productoId') productoId: string,
  ) {
    return this.descuentosProductoService.findByProveedorAndProducto(
      proveedorId,
      productoId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.descuentosProductoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDescuentosProductoDto: UpdateAgroDescuentoProductoDto,
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
