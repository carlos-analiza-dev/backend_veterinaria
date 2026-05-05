import { Module } from '@nestjs/common';
import { ConsumoEquipoService } from './consumo_equipo.service';
import { ConsumoEquipoController } from './consumo_equipo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumoEquipo } from './entities/consumo_equipo.entity';
import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';

@Module({
  controllers: [ConsumoEquipoController],
  imports: [TypeOrmModule.forFeature([ConsumoEquipo, EquipoMaquinaria])],
  providers: [ConsumoEquipoService],
})
export class ConsumoEquipoModule {}
