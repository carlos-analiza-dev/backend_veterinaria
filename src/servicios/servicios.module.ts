import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/auth.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [ServiciosController],
  imports: [
    TypeOrmModule.forFeature([Servicio, Pai, User, Cliente]),
    AuthModule,
    AuthClientesModule,
  ],
  providers: [ServiciosService],
})
export class ServiciosModule {}
