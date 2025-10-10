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
import { ProductosNoVendidosService } from './productos_no_vendidos.service';
import { CreateProductosNoVendidoDto } from './dto/create-productos_no_vendido.dto';
import { UpdateProductosNoVendidoDto } from './dto/update-productos_no_vendido.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('productos-no-vendidos')
export class ProductosNoVendidosController {
  constructor(
    private readonly productosNoVendidosService: ProductosNoVendidosService,
  ) {}

  @Post()
  create(@Body() createProductosNoVendidoDto: CreateProductosNoVendidoDto) {
    return this.productosNoVendidosService.create(createProductosNoVendidoDto);
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.productosNoVendidosService.findAll(user, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosNoVendidosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductosNoVendidoDto: UpdateProductosNoVendidoDto,
  ) {
    return this.productosNoVendidosService.update(
      id,
      updateProductosNoVendidoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosNoVendidosService.remove(id);
  }
}
