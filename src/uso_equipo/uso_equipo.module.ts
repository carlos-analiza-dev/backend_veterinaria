import { Module } from '@nestjs/common';
import { UsoEquipoService } from './uso_equipo.service';
import { UsoEquipoController } from './uso_equipo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsoEquipo } from './entities/uso_equipo.entity';
import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';
import { ActividadesDiaria } from 'src/actividades_diarias/entities/actividades_diaria.entity';
import { ClienteFincaTrabajador } from 'src/cliente_finca_trabajador/entities/cliente_finca_trabajador.entity';

@Module({
  controllers: [UsoEquipoController],
  imports: [
    TypeOrmModule.forFeature([
      UsoEquipo,
      EquipoMaquinaria,
      ActividadesDiaria,
      ClienteFincaTrabajador,
    ]),
  ],
  providers: [UsoEquipoService],
})
export class UsoEquipoModule {}
