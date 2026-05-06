import { Module } from '@nestjs/common';
import { MantenimientoEquipoService } from './mantenimiento_equipo.service';
import { MantenimientoEquipoController } from './mantenimiento_equipo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MantenimientoEquipo } from './entities/mantenimiento_equipo.entity';
import { EquipoMaquinaria } from 'src/equipo_maquinaria/entities/equipo_maquinaria.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { MantenimientoDisparadoresService } from './mantenimiento-disparadores.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [MantenimientoEquipoController],
  imports: [
    TypeOrmModule.forFeature([MantenimientoEquipo, EquipoMaquinaria, Cliente]),
    AuthClientesModule,
  ],
  providers: [
    MantenimientoEquipoService,
    MantenimientoDisparadoresService,
    MailService,
  ],
})
export class MantenimientoEquipoModule {}
