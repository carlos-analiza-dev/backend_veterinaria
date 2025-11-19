import { Module } from '@nestjs/common';
import { PermisosClientesService } from './permisos_clientes.service';
import { PermisosClientesController } from './permisos_clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosCliente } from './entities/permisos_cliente.entity';

@Module({
  controllers: [PermisosClientesController],
  imports: [TypeOrmModule.forFeature([PermisosCliente])],
  providers: [PermisosClientesService],
})
export class PermisosClientesModule {}
