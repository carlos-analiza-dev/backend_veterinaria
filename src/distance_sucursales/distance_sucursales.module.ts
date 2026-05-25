import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DistanceSucursalesService } from './distance_sucursales.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal]), ConfigModule],
  providers: [DistanceSucursalesService],
  exports: [DistanceSucursalesService],
})
export class DistanceSucursalesModule {}
