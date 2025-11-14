import { Controller, Get, Query } from '@nestjs/common';

import { DashboardService } from './dashboards.service';
import { DashboardData } from './interfaces/dashboard-data.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AuthCliente } from 'src/auth-clientes/decorators/auth-cliente.decorator';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { GetCliente } from 'src/auth-clientes/decorators/get-cliente.decorator';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('ingresos-totales')
  @Auth()
  async getIngresosTotales(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.dashboardService.getIngresosTotales(user, paginationDto);
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

  //ANIMALES
  @Get('total-animales')
  @AuthCliente()
  async getTotalAnimales(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getTotalAnimales(cliente);
  }

  @Get('animales-sexo')
  @AuthCliente()
  async getAnimalesPorSexo(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getAnimalesPorSexo(cliente);
  }

  @Get('animales-muerte')
  @AuthCliente()
  async getVivosVsMuertos(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getVivosVsMuertos(cliente);
  }

  @Get('animales-comprados-nacidos')
  @AuthCliente()
  async getCompradosVsNacidos(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getCompradosVsNacidos(cliente);
  }

  //FINCAS
  @Get('total-fincas')
  @AuthCliente()
  async getTotalFincas(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getTotalFincas(cliente);
  }

  @Get('fincas-tipo-explotacion')
  @AuthCliente()
  async getFincasPorTipoExplotacion(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getFincasPorTipoExplotacion(cliente);
  }

  @Get('fincas-especies')
  @AuthCliente()
  async getFincasPorEspecie(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getFincasPorEspecie(cliente);
  }

  //PRODUCCION
  @Get('produccion-ganadera')
  @AuthCliente()
  async getProduccionGanadera(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getProduccionGanaderaPorFinca(cliente);
  }

  //CITAS
  @Get('total-citas')
  @AuthCliente()
  async getTotalCitas(@GetCliente() cliente: Cliente) {
    return await this.dashboardService.getTotalCitas(cliente);
  }
}
