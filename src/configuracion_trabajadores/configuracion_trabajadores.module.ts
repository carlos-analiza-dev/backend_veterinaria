import { Module } from '@nestjs/common';
import { ConfiguracionTrabajadoresService } from './configuracion_trabajadores.service';
import { ConfiguracionTrabajadoresController } from './configuracion_trabajadores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionTrabajadore } from './entities/configuracion_trabajadore.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [ConfiguracionTrabajadoresController],
  imports: [
    TypeOrmModule.forFeature([ConfiguracionTrabajadore, Cliente]),
    AuthClientesModule,
  ],
  providers: [ConfiguracionTrabajadoresService],
})
export class ConfiguracionTrabajadoresModule {}
