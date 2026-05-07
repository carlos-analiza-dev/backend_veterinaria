import { Module } from '@nestjs/common';
import { UsoEquipoService } from './uso_equipo.service';
import { UsoEquipoController } from './uso_equipo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsoEquipo } from './entities/uso_equipo.entity';
import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';
import { ActividadesDiaria } from 'src/actividades_diarias/entities/actividades_diaria.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [UsoEquipoController],
  imports: [
    TypeOrmModule.forFeature([
      UsoEquipo,
      EquipoMaquinaria,
      ActividadesDiaria,
      Cliente,
    ]),
    AuthClientesModule,
  ],
  providers: [UsoEquipoService],
})
export class UsoEquipoModule {}
