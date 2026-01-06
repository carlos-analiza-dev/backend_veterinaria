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
import { ProductoOpinionesService } from './producto_opiniones.service';
import { CreateProductoOpinioneDto } from './dto/create-producto_opinione.dto';
import { UpdateProductoOpinioneDto } from './dto/update-producto_opinione.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('producto-opiniones')
export class ProductoOpinionesController {
  constructor(
    private readonly productoOpinionesService: ProductoOpinionesService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @GetCliente() cliente: Cliente,
    @Body() createProductoOpinioneDto: CreateProductoOpinioneDto,
  ) {
    return this.productoOpinionesService.create(
      cliente,
      createProductoOpinioneDto,
    );
  }

  @Get('producto/:productoId')
  findByProducto(
    @Query() paginationDto: PaginationDto,
    @Param('productoId') productoId: string,
  ) {
    return this.productoOpinionesService.findByProducto(
      paginationDto,
      productoId,
    );
  }

  @Get('verificar-opinion/:productoId')
  @AuthCliente()
  verificarOpinionExistente(
    @GetCliente() cliente: Cliente,
    @Param('productoId') productoId: string,
  ) {
    return this.productoOpinionesService.verificarOpinionExistente(
      cliente,
      productoId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoOpinioneDto: UpdateProductoOpinioneDto,
  ) {
    return this.productoOpinionesService.update(+id, updateProductoOpinioneDto);
  }
}
