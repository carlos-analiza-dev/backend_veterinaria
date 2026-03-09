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
import { InventarioProductosGanaderiaService } from './inventario_productos_ganaderia.service';
import { CreateInventarioProductosGanaderiaDto } from './dto/create-inventario_productos_ganaderia.dto';
import { UpdateInventarioProductosGanaderiaDto } from './dto/update-inventario_productos_ganaderia.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('inventario-productos-ganaderia')
export class InventarioProductosGanaderiaController {
  constructor(
    private readonly inventarioProductosGanaderiaService: InventarioProductosGanaderiaService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body()
    createInventarioProductosGanaderiaDto: CreateInventarioProductosGanaderiaDto,
  ) {
    return this.inventarioProductosGanaderiaService.create(
      createInventarioProductosGanaderiaDto,
    );
  }

  @Get()
  @AuthCliente()
  findAll(
    @GetCliente() cliente: Cliente,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.inventarioProductosGanaderiaService.findAll(
      cliente,
      paginationDto,
    );
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string) {
    return this.inventarioProductosGanaderiaService.findOne(id);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body()
    updateInventarioProductosGanaderiaDto: UpdateInventarioProductosGanaderiaDto,
  ) {
    return this.inventarioProductosGanaderiaService.update(
      id,
      updateInventarioProductosGanaderiaDto,
    );
  }

  @Delete(':id')
  @AuthCliente()
  remove(@Param('id') id: string) {
    return this.inventarioProductosGanaderiaService.remove(id);
  }
}
