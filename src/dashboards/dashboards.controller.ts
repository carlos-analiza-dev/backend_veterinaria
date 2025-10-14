import { Controller, Get, Query } from '@nestjs/common';

import { DashboardService } from './dashboards.service';
import { DashboardData } from './interfaces/dashboard-data.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('top-productos-vendidos')
  @Auth()
  getTopProductosVendidos(@GetUser() user: User) {
    return this.dashboardService.getTopProductosVendidos(user);
  }

  @Get('top-sucursales')
  @Auth()
  async getTopSucursales(
    @GetUser() user: User,
    @Query('limit') limit: number = 5,
  ) {
    return await this.dashboardService.getTopSucursales(user, limit);
  }
}
