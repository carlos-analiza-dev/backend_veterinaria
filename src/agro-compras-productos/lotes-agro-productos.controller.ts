import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { LotesAgroProductosService } from './lotes-agro-productos.service';

@Controller('agro-lotes-productos')
export class AgroProductosController {
  constructor(private readonly lotesService: LotesAgroProductosService) {}

  @Get('producto/:id_producto')
  findByProducto(@Param('id_producto', ParseUUIDPipe) id_producto: string) {
    return this.lotesService.findByProducto(id_producto);
  }
}
