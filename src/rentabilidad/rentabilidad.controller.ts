import { Controller, Get, Query } from '@nestjs/common';
import { RentabilidadService } from './rentabilidad.service';
import { FiltrosRentabilidad } from 'src/interfaces/rentabilidad.interface';

@Controller('rentabilidad')
export class RentabilidadController {
  constructor(private readonly rentabilidadService: RentabilidadService) {}

  @Get('general')
  getRentabilidadGeneral(@Query() filtros: FiltrosRentabilidad) {
    return this.rentabilidadService.obtenerRentabilidadGeneral(filtros);
  }

  @Get('por-periodo')
  getRentabilidadPorPeriodo(
    @Query('periodo') periodo: 'day' | 'week' | 'month' | 'year',
    @Query() filtros: FiltrosRentabilidad,
  ) {
    return this.rentabilidadService.obtenerRentabilidadPorPeriodo(
      periodo,
      filtros,
    );
  }

  @Get('por-categoria')
  getRentabilidadPorCategoria(@Query() filtros: FiltrosRentabilidad) {
    return this.rentabilidadService.obtenerRentabilidadPorCategoria(filtros);
  }

  @Get('por-finca')
  getRentabilidadPorFinca(@Query() filtros: FiltrosRentabilidad) {
    return this.rentabilidadService.obtenerRentabilidadPorFinca(filtros);
  }
}
