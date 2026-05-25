import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SucursalesService } from './sucursales.service';
import { SucursalesController } from './sucursales.controller';
import { Sucursal } from './entities/sucursal.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/auth.entity';
import { Pai } from '../pais/entities/pai.entity';
import { DistanceSucursalesModule } from 'src/distance_sucursales/distance_sucursales.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sucursal, User, Pai]),
    AuthModule,
    DistanceSucursalesModule,
  ],
  controllers: [SucursalesController],
  providers: [SucursalesService],
  exports: [TypeOrmModule, SucursalesService],
})
export class SucursalesModule {}
