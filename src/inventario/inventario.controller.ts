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
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { UpdateCantidadDto } from './dto/update-cantidad.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  create(@Body() createInventarioDto: CreateInventarioDto) {
    return this.inventarioService.create(createInventarioDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.inventarioService.findAll(paginationDto);
  }

  @Get('insumos-disponibles')
  findProductosDisponibles() {
    return this.inventarioService.findInsumosDisponibles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioService.findOne(id);
  }

  @Patch('reducir')
  async reducirCantidad(@Body() updateCantidadDto: UpdateCantidadDto) {
    return this.inventarioService.reducirCantidad(
      updateCantidadDto.insumoId,
      updateCantidadDto.cantidadUsada,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventarioDto: UpdateInventarioDto,
  ) {
    return this.inventarioService.update(id, updateInventarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioService.remove(id);
  }
}
