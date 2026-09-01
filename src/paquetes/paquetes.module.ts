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
import { PaqueteNotificacionService } from './paquete-notificacion.service';
import { ClientePaquete } from 'src/cliente_paquetes/entities/cliente_paquete.entity';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [PaquetesController],
  imports: [
    TypeOrmModule.forFeature([
      Paquete,
      PaquetePais,
      PaquetePermiso,
      User,
      Cliente,
      ClientePaquete,
    ]),
    AuthModule,
    AuthClientesModule,
  ],
  providers: [PaquetesService, PaqueteNotificacionService, MailService],
})
export class PaquetesModule {}
