import { Controller, Get, Query } from '@nestjs/common';

import { DashboardService } from './dashboards.service';
import { DashboardData } from './interfaces/dashboard-data.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('ingresos-totales')
  async getIngresosTotales(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.getIngresosTotales(paginationDto);
  }

  @Get('clientes-activos')
  @Auth()
  async getClientesActivos(@GetUser() user: User) {
    return await this.dashboardService.getClientesActivos(user);
  }

  @Get('usuarios-activos')
  @Auth()
  async getUsuariosActivos(@GetUser() user: User) {
    return await this.dashboardService.getUsuariosActivos(user);
  }

  @Get('rendimiento-mensual')
  @Auth()
  async getRendimientoMensual(
    @GetUser() user: User,
    @Query('year') year?: number,
  ) {
    return await this.dashboardService.getRendimientoMensual(user, year);
  }

  @Get('tendencia-ingresos')
  @Auth()
  async getTendenciaIngresos(
    @GetUser() user: User,
    @Query('year') year?: number,
  ) {
    return await this.dashboardService.getTendenciaIngresos(user, year);
  }

  @Get('top-productos-vendidos')
  @Auth()
  getTopProductosVendidos(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.dashboardService.getTopProductosVendidos(user, paginationDto);
  }

  @Get('top-servicios-vendidos')
  @Auth()
  getTopServiciosVendidos(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.dashboardService.getTopServiciosVendidos(user, paginationDto);
  }

  @Get('top-sucursales')
  @Auth()
  async getTopSucursales(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.dashboardService.getTopSucursales(user, paginationDto);
  }
}
