import { Module } from '@nestjs/common';
import { AgroSucursalesService } from './agro-sucursales.service';
import { AgroSucursalesController } from './agro-sucursales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgroSucursale } from './entities/agro-sucursale.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Module({
  controllers: [AgroSucursalesController],
  imports: [TypeOrmModule.forFeature([AgroSucursale, EmpleadosAgro])],
  providers: [AgroSucursalesService],
})
export class AgroSucursalesModule {}
