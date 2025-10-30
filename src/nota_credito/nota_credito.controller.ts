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
import { NotaCreditoService } from './nota_credito.service';
import { CreateNotaCreditoDto } from './dto/create-nota_credito.dto';
import { UpdateNotaCreditoDto } from './dto/update-nota_credito.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('nota-credito')
export class NotaCreditoController {
  constructor(private readonly notaCreditoService: NotaCreditoService) {}

  @Post()
  @Auth()
  create(
    @GetUser() user: User,
    @Body() createNotaCreditoDto: CreateNotaCreditoDto,
  ) {
    return this.notaCreditoService.create(user, createNotaCreditoDto);
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.notaCreditoService.findAll(user, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notaCreditoService.findOne(id);
  }

  /*  @Get('factura/:facturaId')
  findByFactura(@Param('facturaId') facturaId: string) {
    return this.notaCreditoService.findByFactura(facturaId);
  }

  @Get(':id/movimientos')
  getMovimientos(@Param('id') id: string) {
    return this.notaCreditoService.getMovimientosPorNotaCredito(id);
  }

  @Get('producto/:productoId/devoluciones')
  getDevolucionesPorProducto(@Param('productoId') productoId: string) {
    return this.notaCreditoService.getHistorialDevolucionesPorProducto(productoId);
  } */

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notaCreditoService.remove(id);
  }
}
