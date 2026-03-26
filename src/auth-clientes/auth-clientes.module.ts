import { Module } from '@nestjs/common';
import { AuthClientesService } from './auth-clientes.service';
import { AuthClientesController } from './auth-clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Pai } from 'src/pais/entities/pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { Cliente } from './entities/auth-cliente.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { JwtClienteStrategy } from './strategies-client/jwt.strtategy';
import { User } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import { NotificacionesAdminsModule } from 'src/notificaciones_admins/notificaciones_admins.module';

@Module({
  controllers: [AuthClientesController],
  providers: [AuthClientesService, MailService, JwtClienteStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Cliente,
      Pai,
      MunicipiosDepartamentosPai,
      DepartamentosPai,
      User,
    ]),
    AuthModule,
    NotificacionesAdminsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
  ],
})
export class AuthClientesModule {}
