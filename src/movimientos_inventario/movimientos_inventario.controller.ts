import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MovimientosInventarioService } from './movimientos_inventario.service';
import { CreateMovimientosInventarioDto } from './dto/create-movimientos_inventario.dto';
import { UpdateMovimientosInventarioDto } from './dto/update-movimientos_inventario.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(private readonly movimientosInventarioService: MovimientosInventarioService) {}

  @Post()
  create(@Body() createMovimientosInventarioDto: CreateMovimientosInventarioDto) {
    return this.movimientosInventarioService.create(createMovimientosInventarioDto);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.movimientosInventarioService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosInventarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovimientosInventarioDto: UpdateMovimientosInventarioDto) {
    return this.movimientosInventarioService.update(+id, updateMovimientosInventarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimientosInventarioService.remove(+id);
  }
}
