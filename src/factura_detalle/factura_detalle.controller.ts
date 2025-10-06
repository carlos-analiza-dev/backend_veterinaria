import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FacturaDetalleService } from './factura_detalle.service';
import { CreateFacturaDetalleDto } from './dto/create-factura_detalle.dto';
import { UpdateFacturaDetalleDto } from './dto/update-factura_detalle.dto';

@Controller('factura-detalle')
export class FacturaDetalleController {
  constructor(private readonly facturaDetalleService: FacturaDetalleService) {}

  @Post()
  create(@Body() createFacturaDetalleDto: CreateFacturaDetalleDto) {
    return this.facturaDetalleService.create(createFacturaDetalleDto);
  }

  @Post('multiple')
  createMultiple(@Body() detallesDto: CreateFacturaDetalleDto[]) {
    return this.facturaDetalleService.crearMultiplesDetalles(detallesDto);
  }

  @Get('factura/:id')
  findByFactura(@Param('id') id: string) {
    return this.facturaDetalleService.findByFacturaId(id);
  }

  @Get('subtotal/:id')
  async getSubtotal(@Param('id') id: string) {
    const subtotal = await this.facturaDetalleService.calcularSubtotalFactura(
      id,
    );
    return { subtotal };
  }
}
