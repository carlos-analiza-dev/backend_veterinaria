import { Module } from '@nestjs/common';
import { EmpleadosAgroService } from './empleados-agro.service';
import { EmpleadosAgroController } from './empleados-agro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadosAgro } from './entities/empleados-agro.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { RolesAgro } from 'src/roles-agro/entities/roles-agro.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { ValidationService } from 'src/validations/validation-uniques.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtEmpleadoStrategy } from './strategies/jwt.strategy';
import { ClientePaquete } from 'src/cliente_paquetes/entities/cliente_paquete.entity';

@Module({
  controllers: [EmpleadosAgroController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      EmpleadosAgro,
      AgroSucursale,
      Pai,
      DepartamentosPai,
      MunicipiosDepartamentosPai,
      RolesAgro,
      Cliente,
      User,
      DatosAgroservicio,
      ClientePaquete,
    ]),
    AuthClientesModule,
    PassportModule.register({ defaultStrategy: 'jwt-empleado' }),
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

  providers: [EmpleadosAgroService, ValidationService, JwtEmpleadoStrategy],
})
export class EmpleadosAgroModule {}
