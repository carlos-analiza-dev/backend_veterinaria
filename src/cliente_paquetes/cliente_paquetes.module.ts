import { Module } from '@nestjs/common';
import { ClientePaquetesService } from './cliente_paquetes.service';
import { ClientePaquetesController } from './cliente_paquetes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientePaquete } from './entities/cliente_paquete.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [ClientePaquetesController],
  imports: [
    TypeOrmModule.forFeature([ClientePaquete, Paquete, Cliente]),
    AuthClientesModule,
  ],
  providers: [ClientePaquetesService],
})
export class ClientePaquetesModule {}
