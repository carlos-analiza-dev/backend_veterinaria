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
import { EscalasInsumosService } from './escalas_insumos.service';
import { CreateEscalasInsumoDto } from './dto/create-escalas_insumo.dto';
import { UpdateEscalasInsumoDto } from './dto/update-escalas_insumo.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('escalas-insumos')
export class EscalasInsumosController {
  constructor(private readonly escalasInsumosService: EscalasInsumosService) {}

  @Post()
  create(@Body() createEscalasInsumoDto: CreateEscalasInsumoDto) {
    return this.escalasInsumosService.create(createEscalasInsumoDto);
  }

  @Get()
  findAll() {
    return this.escalasInsumosService.findAll();
  }

  @Get('insumo/:insumoId')
  findByinsumo(
    @Query() paginationDto: PaginationDto,
    @Param('insumoId') insumoId: string,
  ) {
    return this.escalasInsumosService.findByInsumo(paginationDto, insumoId);
  }

  @Get('insumo-escalas/:insumoId')
  findByinsumoEscalas(@Param('insumoId') insumoId: string) {
    return this.escalasInsumosService.findByInsumoEscalas(insumoId);
  }

  @Get('proveedor/:proveedorId/insumo/:insumoId')
  findByProveedorAndinsumo(
    @Param('proveedorId') proveedorId: string,
    @Param('insumoId') insumoId: string,
  ) {
    return this.escalasInsumosService.findByProveedorAndInsumo(
      proveedorId,
      insumoId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEscalasInsumoDto: UpdateEscalasInsumoDto,
  ) {
    return this.escalasInsumosService.update(id, updateEscalasInsumoDto);
  }
}
