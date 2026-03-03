import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductosGanaderiaService } from './productos_ganaderia.service';
import { CreateProductosGanaderiaDto } from './dto/create-productos_ganaderia.dto';
import { UpdateProductosGanaderiaDto } from './dto/update-productos_ganaderia.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('productos-ganaderia')
export class ProductosGanaderiaController {
  constructor(
    private readonly productosGanaderiaService: ProductosGanaderiaService,
  ) {}

  @Post()
  @AuthCliente()
  create(
    @Body() createProductosGanaderiaDto: CreateProductosGanaderiaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.productosGanaderiaService.create(
      createProductosGanaderiaDto,
      cliente,
    );
  }

  @Get()
  @AuthCliente()
  findAll(@GetCliente() cliente: Cliente) {
    return this.productosGanaderiaService.findAll(cliente);
  }

  @Get(':id')
  @AuthCliente()
  findOne(@Param('id') id: string, @GetCliente() cliente: Cliente) {
    return this.productosGanaderiaService.findOne(id, cliente);
  }

  @Patch(':id')
  @AuthCliente()
  update(
    @Param('id') id: string,
    @Body() updateProductosGanaderiaDto: UpdateProductosGanaderiaDto,
    @GetCliente() cliente: Cliente,
  ) {
    return this.productosGanaderiaService.update(
      id,
      updateProductosGanaderiaDto,
      cliente,
    );
  }

  @Delete(':id')
  @AuthCliente()
  remove(@Param('id') id: string, @GetCliente() cliente: Cliente) {
    return this.productosGanaderiaService.remove(id, cliente);
  }
}
