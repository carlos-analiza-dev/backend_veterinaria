import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { SubServiciosService } from './sub_servicios.service';

import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('sub-servicios')
export class SubServiciosController {
  constructor(private readonly subServiciosService: SubServiciosService) {}

  @Post('servicio')
  createServicio(@Body() createServicioDto: CreateServicioDto) {
    return this.subServiciosService.createServicio(createServicioDto);
  }

  @Post('producto')
  createProducto(@Body() createProductoDto: CreateProductoDto) {
    return this.subServiciosService.createProducto(createProductoDto);
  }

  @Get('productos')
  findAllProductos(@Query() paginationDto: PaginationDto) {
    return this.subServiciosService.findAllProductos(paginationDto);
  }

  @Get('productos-disponibles')
  @Auth()
  findAllProductosDisponibles(@GetUser() user: User) {
    return this.subServiciosService.findAllProductosDisponibles(user);
  }

  @Get('servicios-disponibles')
  @Auth()
  findAllServiciosDisponibles(@GetUser() user: User) {
    return this.subServiciosService.findAllServiciosDisponibles(user);
  }

  @Get('productos-disponibles-clientes')
  @AuthCliente()
  findAllProductosDisponiblesClientes(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.subServiciosService.findAllProductosDisponiblesClientes(
      cliente,
      paginationDto,
    );
  }

  @Get('servicio/:servicioId')
  findAll(@Param('servicioId') servicioId: string) {
    return this.subServiciosService.findAll(servicioId);
  }

  @Get('servicio-pais/:servicioId/:paisId/:cantidadAnimales')
  findAllPreciosCantidadAnimales(
    @Param('servicioId') servicioId: string,
    @Param('paisId') paisId: string,
    @Param('cantidadAnimales') cantidadAnimales: number,
  ) {
    return this.subServiciosService.findAllPreciosCantidadAnimales(
      servicioId,
      paisId,
      cantidadAnimales,
    );
  }

  @Get('producto/:id')
  productoById(@Param('id') id: string) {
    return this.subServiciosService.productoById(id);
  }

  @Get('categoria/:categoriaId')
  @AuthCliente()
  getProductosPorCategoria(
    @Param('categoriaId', ParseUUIDPipe) categoriaId: string,
    @Query() paginationDto: PaginationDto,
    @GetCliente() cliente: Cliente,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.subServiciosService.getProductosRelacionados(
      categoriaId,
      paginationDto,
      cliente,
      limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subServiciosService.findOne(id);
  }

  @Patch('servicio/:id')
  updateServicio(
    @Param('id') id: string,
    @Body() updateServicioDto: UpdateServicioDto,
  ) {
    return this.subServiciosService.updateServicio(id, updateServicioDto);
  }

  @Patch('producto/:id')
  updateProducto(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.subServiciosService.updateProducto(id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subServiciosService.remove(+id);
  }
}
