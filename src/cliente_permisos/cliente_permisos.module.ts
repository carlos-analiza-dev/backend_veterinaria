import { Module } from '@nestjs/common';
import { ClientePermisosService } from './cliente_permisos.service';
import { ClientePermisosController } from './cliente_permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientePermiso } from './entities/cliente_permiso.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PermisosCliente } from 'src/permisos_clientes/entities/permisos_cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [ClientePermisosController],
  imports: [
    TypeOrmModule.forFeature([ClientePermiso, Cliente, PermisosCliente]),
    AuthClientesModule,
  ],
  providers: [ClientePermisosService],
})
export class ClientePermisosModule {}
