import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SucursalesService } from './sucursales.service';
import { SucursalesController } from './sucursales.controller';
import { Sucursal } from './entities/sucursal.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/auth.entity';
import { Pai } from '../pais/entities/pai.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal, User, Pai]), AuthModule],
  controllers: [SucursalesController],
  providers: [SucursalesService],
  exports: [TypeOrmModule, SucursalesService],
})
export class SucursalesModule {}
