import { Module } from '@nestjs/common';
import { MantenimientoEquipoService } from './mantenimiento_equipo.service';
import { MantenimientoEquipoController } from './mantenimiento_equipo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MantenimientoEquipo } from './entities/mantenimiento_equipo.entity';
import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';

@Module({
  controllers: [MantenimientoEquipoController],
  imports: [TypeOrmModule.forFeature([MantenimientoEquipo, EquipoMaquinaria])],
  providers: [MantenimientoEquipoService],
})
export class MantenimientoEquipoModule {}
