import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EscalasProductoService } from './escalas_producto.service';
import { CreateEscalasProductoDto } from './dto/create-escalas_producto.dto';
import { UpdateEscalasProductoDto } from './dto/update-escalas_producto.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('escalas-producto')
export class EscalasProductoController {
  constructor(
    private readonly escalasProductoService: EscalasProductoService,
  ) {}

  @Post()
  create(@Body() createEscalasProductoDto: CreateEscalasProductoDto) {
    return this.escalasProductoService.create(createEscalasProductoDto);
  }

  @Get()
  findAll() {
    return this.escalasProductoService.findAll();
  }

  @Get('producto/:productoId')
  findByProducto(
    @Query() paginationDto: PaginationDto,
    @Param('productoId') productoId: string,
  ) {
    return this.escalasProductoService.findByProducto(
      paginationDto,
      productoId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.escalasProductoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEscalasProductoDto: UpdateEscalasProductoDto,
  ) {
    return this.escalasProductoService.update(id, updateEscalasProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.escalasProductoService.remove(id);
  }

  @Delete('producto/:productoId')
  removeByProducto(@Param('productoId') productoId: string) {
    return this.escalasProductoService.removeByProducto(productoId);
  }
}
