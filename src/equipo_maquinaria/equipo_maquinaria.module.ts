import { Module } from '@nestjs/common';
import { EquipoMaquinariaService } from './equipo_maquinaria.service';
import { EquipoMaquinariaController } from './equipo_maquinaria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipoMaquinaria } from './entities/equipo_maquinaria.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [EquipoMaquinariaController],
  imports: [
    TypeOrmModule.forFeature([EquipoMaquinaria, FincasGanadero, Cliente]),
    AuthClientesModule,
  ],
  providers: [EquipoMaquinariaService],
})
export class EquipoMaquinariaModule {}
