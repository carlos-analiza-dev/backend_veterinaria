import { Module } from '@nestjs/common';
import { AuthClientesService } from './auth-clientes.service';
import { AuthClientesController } from './auth-clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Pai } from 'src/pais/entities/pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { Cliente } from './entities/auth-cliente.entity';

@Module({
  controllers: [AuthClientesController],
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      Pai,
      MunicipiosDepartamentosPai,
      DepartamentosPai,
    ]),
  ],
  providers: [AuthClientesService],
})
export class AuthClientesModule {}
