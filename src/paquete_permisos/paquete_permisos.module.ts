import { Module } from '@nestjs/common';
import { PaquetePermisosService } from './paquete_permisos.service';
import { PaquetePermisosController } from './paquete_permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { PaquetePermiso } from './entities/paquete_permiso.entity';
import { PermisosCliente } from 'src/permisos_clientes/entities/permisos_cliente.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [PaquetePermisosController],
  imports: [
    TypeOrmModule.forFeature([
      PaquetePermiso,
      Paquete,
      PermisosCliente,
      User,
      Cliente,
    ]),
    AuthModule,
    AuthClientesModule,
  ],
  providers: [PaquetePermisosService],
})
export class PaquetePermisosModule {}
