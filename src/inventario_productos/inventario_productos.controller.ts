import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InventarioProductosService } from './inventario_productos.service';
import { CreateInventarioProductoDto } from './dto/create-inventario_producto.dto';
import { UpdateInventarioProductoDto } from './dto/update-inventario_producto.dto';
import { UpdateCantidadDto } from './dto/update-cantidad.dto';

@Controller('inventario-productos')
export class InventarioProductosController {
  constructor(
    private readonly inventarioProductosService: InventarioProductosService,
  ) {}

  @Post()
  create(@Body() createInventarioDto: CreateInventarioProductoDto) {
    return this.inventarioProductosService.create(createInventarioDto);
  }

  @Get()
  findAll() {
    return this.inventarioProductosService.findAll();
  }

  @Get('productos-disponibles')
  findProductosDisponibles() {
    return this.inventarioProductosService.findproductosDisponibles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioProductosService.findOne(id);
  }

  @Patch('reducir')
  async reducirCantidad(@Body() updateCantidadDto: UpdateCantidadDto) {
    return this.inventarioProductosService.reducirCantidad(
      updateCantidadDto.productoId,
      updateCantidadDto.cantidadUsada,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventarioDto: UpdateInventarioProductoDto,
  ) {
    return this.inventarioProductosService.update(id, updateInventarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioProductosService.remove(id);
  }
}
