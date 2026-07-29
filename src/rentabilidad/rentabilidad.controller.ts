import { Controller, Get, Query } from '@nestjs/common';
import { RentabilidadService } from './rentabilidad.service';
import { FiltrosRentabilidad } from 'src/interfaces/rentabilidad.interface';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Controller('rentabilidad')
export class RentabilidadController {
  constructor(private readonly rentabilidadService: RentabilidadService) {}

  @Get('general')
  @AuthCliente()
  getRentabilidadGeneral(
    @GetCliente() cliente: Cliente,
    @Query() filtros: FiltrosRentabilidad,
  ) {
    return this.rentabilidadService.obtenerRentabilidadGeneral(
      cliente,
      filtros,
    );
  }

  @Get('por-periodo')
  @AuthCliente()
  getRentabilidadPorPeriodo(
    @GetCliente() cliente: Cliente,
    @Query('periodo') periodo: 'day' | 'week' | 'month' | 'year',
    @Query() filtros: FiltrosRentabilidad,
  ) {
    return this.rentabilidadService.obtenerRentabilidadPorPeriodo(
      cliente,
      periodo,
      filtros,
    );
  }

  @Get('por-categoria')
  @AuthCliente()
  getRentabilidadPorCategoria(
    @GetCliente() cliente: Cliente,
    @Query() filtros: FiltrosRentabilidad,
  ) {
    return this.rentabilidadService.obtenerRentabilidadPorCategoria(
      cliente,
      filtros,
    );
  }

  @Get('por-finca')
  @AuthCliente()
  getRentabilidadPorFinca(
    @GetCliente() cliente: Cliente,
    @Query() filtros: FiltrosRentabilidad,
  ) {
    return this.rentabilidadService.obtenerRentabilidadPorFinca(
      cliente,
      filtros,
    );
  }
}
