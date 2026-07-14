import { Module } from '@nestjs/common';
import { EmpleadosAgroService } from './empleados-agro.service';
import { EmpleadosAgroController } from './empleados-agro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadosAgro } from './entities/empleados-agro.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';

@Module({
  controllers: [EmpleadosAgroController],
  imports: [TypeOrmModule.forFeature([EmpleadosAgro, AgroSucursale])],
  providers: [EmpleadosAgroService],
})
export class EmpleadosAgroModule {}
