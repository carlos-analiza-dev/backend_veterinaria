import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Pai } from 'src/pais/entities/pai.entity';
import { MailService } from 'src/mail/mail.service';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Role } from 'src/roles/entities/role.entity';
import { ProfileImage } from 'src/profile_images/entities/profile_image.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailService],
  exports: [TypeOrmModule, JwtModule, PassportModule, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Pai,
      DepartamentosPai,
      MunicipiosDepartamentosPai,
      Role,
      ProfileImage,
      Sucursal,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '12h',
          },
        };
      },
    }),
  ],
})
export class AuthModule {}
