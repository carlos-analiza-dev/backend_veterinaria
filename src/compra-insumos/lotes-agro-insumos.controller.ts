import { Controller, Get, Param, Query } from '@nestjs/common';
import { LotesAgroInsumosService } from './lotes-agro-insumos.service';

@Controller('lotes-agro-insumos')
export class LotesAgroInsumosController {
  constructor(
    private readonly lotesAgroInsumosService: LotesAgroInsumosService,
  ) {}

  @Get('cantidad/:sucursalId/:insumoId')
  async obtenerCantidadPorSucursal(
    @Param('sucursalId') sucursalId: string,
    @Param('insumoId') insumoId: string,
  ) {
    return this.lotesAgroInsumosService.obtenerCantidadPorSucursal(
      sucursalId,
      insumoId,
    );
  }
}
