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
import { MovimientosLoteService } from './movimientos_lote.service';
import { CreateMovimientosLoteDto } from './dto/create-movimientos.dto';
import { UpdateMovimientosLoteDto } from './dto/update-movimientos.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('movimientos-lote')
export class MovimientosLoteController {
  constructor(
    private readonly movimientosLoteService: MovimientosLoteService,
  ) {}

  @Post()
  create(@Body() createDto: CreateMovimientosLoteDto) {
    return this.movimientosLoteService.create(createDto);
  }

  @Get('sucursal/:sucursalId')
  findAll(
    @Param('sucursalId') sucursalId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.movimientosLoteService.findAll(sucursalId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosLoteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMovimientosLoteDto) {
    return this.movimientosLoteService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimientosLoteService.remove(id);
  }
}
