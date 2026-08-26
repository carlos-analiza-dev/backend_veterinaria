import { Module } from '@nestjs/common';
import { CodigosPaquetesService } from './codigos_paquetes.service';
import { CodigosPaquetesController } from './codigos_paquetes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodigosPaquete } from './entities/codigos_paquete.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { AuthModule } from 'src/auth/auth.module';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { ClientePaquete } from 'src/cliente_paquetes/entities/cliente_paquete.entity';

@Module({
  controllers: [CodigosPaquetesController],
  imports: [
    TypeOrmModule.forFeature([CodigosPaquete, Paquete, ClientePaquete]),
    AuthModule,
    AuthClientesModule,
  ],
  providers: [CodigosPaquetesService],
})
export class CodigosPaquetesModule {}
