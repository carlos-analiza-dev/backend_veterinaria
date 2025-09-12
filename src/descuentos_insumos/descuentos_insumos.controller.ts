import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DescuentosInsumosService } from './descuentos_insumos.service';
import { CreateDescuentosInsumoDto } from './dto/create-descuentos_insumo.dto';
import { UpdateDescuentosInsumoDto } from './dto/update-descuentos_insumo.dto';

@Controller('descuentos-insumos')
export class DescuentosInsumosController {
  constructor(
    private readonly descuentosInsumosService: DescuentosInsumosService,
  ) {}

  @Post()
  create(@Body() createDescuentosInsumoDto: CreateDescuentosInsumoDto) {
    return this.descuentosInsumosService.create(createDescuentosInsumoDto);
  }

  @Get()
  findAll() {
    return this.descuentosInsumosService.findAll();
  }

  @Get('insumo/:insumoId')
  findDescuentoInsumo(@Param('insumoId') insumoId: string) {
    return this.descuentosInsumosService.findDescuentoInsumo(insumoId);
  }

  @Get('proveedor/:proveedorId/insumo/:insumoId')
  findByProveedorAndInsumo(
    @Param('proveedorId') proveedorId: string,
    @Param('insumoId') insumoId: string,
  ) {
    return this.descuentosInsumosService.findByProveedorAndInsumo(
      proveedorId,
      insumoId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDescuentosinsumoDto: UpdateDescuentosInsumoDto,
  ) {
    return this.descuentosInsumosService.update(id, updateDescuentosinsumoDto);
  }
}
