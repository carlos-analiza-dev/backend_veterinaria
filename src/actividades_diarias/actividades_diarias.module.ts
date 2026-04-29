import { Module } from '@nestjs/common';
import { ActividadesDiariasService } from './actividades_diarias.service';
import { ActividadesDiariasController } from './actividades_diarias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadesDiaria } from './entities/actividades_diaria.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { ActividadFoto } from 'src/actividad_fotos/entities/actividad_foto.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { MailService } from 'src/mail/mail.service';
import { ClienteFincaTrabajador } from 'src/cliente_finca_trabajador/entities/cliente_finca_trabajador.entity';

@Module({
  controllers: [ActividadesDiariasController],
  imports: [
    TypeOrmModule.forFeature([
      ActividadesDiaria,
      Cliente,
      ActividadFoto,
      FincasGanadero,
      ClienteFincaTrabajador,
    ]),
    AuthClientesModule,
  ],
  providers: [ActividadesDiariasService, MailService],
})
export class ActividadesDiariasModule {}
