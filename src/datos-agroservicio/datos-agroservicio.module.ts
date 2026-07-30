import { Module } from '@nestjs/common';
import { DatosAgroservicioService } from './datos-agroservicio.service';
import { DatosAgroservicioController } from './datos-agroservicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosAgroservicio } from './entities/datos-agroservicio.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { User } from 'src/auth/entities/auth.entity';
import { DescuentosAgroCliente } from 'src/descuentos_clientes/entities/descuentos_clientes_agro.entity';

@Module({
  controllers: [DatosAgroservicioController],
  imports: [
    TypeOrmModule.forFeature([
      DatosAgroservicio,
      Cliente,
      User,
      DescuentosAgroCliente,
    ]),
    AuthClientesModule,
  ],
  providers: [DatosAgroservicioService],
})
export class DatosAgroservicioModule {}
