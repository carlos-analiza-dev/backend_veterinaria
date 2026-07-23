import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { AgroComprasProductosService } from './agro-compras-productos.service';
import { CreateAgroComprasProductoDto } from './dto/create-agro-compras-producto.dto';
import { UpdateAgroComprasProductoDto } from './dto/update-agro-compras-producto.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { GetEmpleado } from 'src/empleados-agro/decorators/get-empleado.decorator';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { AuthEmpleado } from 'src/empleados-agro/decorators/auth-empleado.decorator';

@Controller('agro-compras-productos')
export class AgroComprasProductosController {
  constructor(
    private readonly agroComprasProductosService: AgroComprasProductosService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createCompraDto: CreateAgroComprasProductoDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.agroComprasProductosService.create(createCompraDto, cliente);
  }

  @Post('empleado')
  @AuthEmpleado()
  createEmpleado(
    @Body() createCompraDto: CreateAgroComprasProductoDto,
    @GetEmpleado() empleado: EmpleadosAgro,
  ) {
    return this.agroComprasProductosService.createEmpleado(
      createCompraDto,
      empleado,
    );
  }

  @Get('agro-compras/:propietarioId')
  findAll(
    @Param('propietarioId', ParseUUIDPipe) propietarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.agroComprasProductosService.findAll(
      propietarioId,
      paginationDto,
    );
  }

  @Get('existencias/:productoId')
  getExistenciasProducto(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    return this.agroComprasProductosService.getExistenciasProducto(
      productoId,
      sucursalId,
    );
  }

  @Post('reducir-inventario')
  reducirInventario(
    @Body() body: { productoId: string; sucursalId: string; cantidad: number },
  ) {
    return this.agroComprasProductosService.reducirInventario(
      body.productoId,
      body.sucursalId,
      body.cantidad,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.agroComprasProductosService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompraDto: UpdateAgroComprasProductoDto,
  ) {
    return this.agroComprasProductosService.update(id, updateCompraDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.agroComprasProductosService.remove(id);
  }
}
