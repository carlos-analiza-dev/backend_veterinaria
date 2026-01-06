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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { EstadoPedido } from './entities/pedido.entity';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AuthCliente()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get('estadisticas')
  getEstadisticas() {
    return this.pedidosService.getEstadisticas();
  }

  @Get('cliente')
  @AuthCliente()
  findByCliente(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.pedidosService.findByCliente(cliente, paginationDto);
  }

  @Get('sucursal/:sucursalId')
  @Auth()
  findBySucursal(
    @Param('sucursalId', ParseUUIDPipe) sucursalId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.pedidosService.findBySucursal(sucursalId, paginationDto);
  }

  @Get('verificar-compra/:productoId')
  @AuthCliente()
  verificarCompraProducto(
    @GetCliente() cliente: Cliente,
    @Param('productoId', ParseUUIDPipe) productoId: string,
  ) {
    return this.pedidosService.verificarCompraProducto(cliente, productoId);
  }

  @Get('estado/:estado')
  findByEstado(@Param('estado') estado: EstadoPedido) {
    return this.pedidosService.findByEstado(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pedidosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    return this.pedidosService.update(id, updatePedidoDto);
  }

  @Patch(':id/estado/:estado')
  updateEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('estado') estado: EstadoPedido,
  ) {
    return this.pedidosService.updateEstado(id, estado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pedidosService.remove(id);
  }
}
