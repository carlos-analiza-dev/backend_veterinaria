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
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { UpdateAgroEscalaProductoDto } from './dto/update-escala-agro-producto.dto';
import { CreateEscalasAgroProductoDto } from './dto/create-escala-agro-producto.dto';
import { EscalasAgroProductoService } from './escalas-agro-productos.service';

@Controller('escalas-agro-producto')
export class EscalasAgroProductoController {
  constructor(
    private readonly escalasProductoService: EscalasAgroProductoService,
  ) {}

  @Post()
  create(@Body() createEscalasProductoDto: CreateEscalasAgroProductoDto) {
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

  @Get('producto-escalas/:productoId')
  findByProductoEscalas(@Param('productoId') productoId: string) {
    return this.escalasProductoService.findByProductoEscalas(productoId);
  }

  @Get('proveedor/:proveedorId/producto/:productoId')
  findByProveedorAndProducto(
    @Param('proveedorId') proveedorId: string,
    @Param('productoId') productoId: string,
  ) {
    return this.escalasProductoService.findByProveedorAndProducto(
      proveedorId,
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
    @Body() updateEscalasProductoDto: UpdateAgroEscalaProductoDto,
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
