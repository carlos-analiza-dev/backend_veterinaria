import { Module } from '@nestjs/common';
import { PaquetePermisosService } from './paquete_permisos.service';
import { PaquetePermisosController } from './paquete_permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { PaquetePermiso } from './entities/paquete_permiso.entity';
import { PermisosCliente } from 'src/permisos_clientes/entities/permisos_cliente.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  controllers: [PaquetePermisosController],
  imports: [
    TypeOrmModule.forFeature([PaquetePermiso, Paquete, PermisosCliente, User]),
    AuthModule,
  ],
  providers: [PaquetePermisosService],
})
export class PaquetePermisosModule {}
