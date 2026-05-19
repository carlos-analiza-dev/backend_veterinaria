import { Module } from '@nestjs/common';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paquete } from './entities/paquete.entity';
import { PaquetePais } from 'src/paquete_pais/entities/paquete_pai.entity';
import { PaquetePermiso } from 'src/paquete_permisos/entities/paquete_permiso.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [PaquetesController],
  imports: [
    TypeOrmModule.forFeature([
      Paquete,
      PaquetePais,
      PaquetePermiso,
      User,
      Cliente,
    ]),
    AuthModule,
    AuthClientesModule,
  ],
  providers: [PaquetesService],
})
export class PaquetesModule {}
