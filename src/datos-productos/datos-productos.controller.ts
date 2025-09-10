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
import { DatosProductosService } from './datos-productos.service';
import { CreateDatosProductoDto } from './dto/create-datos-producto.dto';
import { UpdateDatosProductoDto } from './dto/update-datos-producto.dto';

@Controller('datos-productos')
export class DatosProductosController {
  constructor(private readonly datosProductosService: DatosProductosService) {}

  @Post()
  create(@Body() createDatosProductoDto: CreateDatosProductoDto) {
    return this.datosProductosService.create(createDatosProductoDto);
  }

  @Get()
  findAll(@Query('sucursalId') sucursalId?: string) {
    return this.datosProductosService.findAll(sucursalId);
  }

  @Get('punto-reorden/:sucursalId')
  checkPuntoReorden(@Param('sucursalId') sucursalId: string) {
    return this.datosProductosService.checkPuntoReorden(sucursalId);
  }

  @Get('producto-sucursal/:sub_servicioId/:sucursalId')
  getProductoSucursal(
    @Param('sub_servicioId') sub_servicioId: string,
    @Param('sucursalId') sucursalId: string,
  ) {
    return this.datosProductosService.getProductoSucursal(sub_servicioId, sucursalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.datosProductosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDatosProductoDto: UpdateDatosProductoDto) {
    return this.datosProductosService.update(id, updateDatosProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.datosProductosService.remove(id);
  }
}