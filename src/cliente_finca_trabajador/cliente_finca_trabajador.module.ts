import { Module } from '@nestjs/common';
import { ClienteFincaTrabajadorService } from './cliente_finca_trabajador.service';
import { ClienteFincaTrabajadorController } from './cliente_finca_trabajador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { ClienteFincaTrabajador } from './entities/cliente_finca_trabajador.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [ClienteFincaTrabajadorController],
  imports: [
    TypeOrmModule.forFeature([Cliente, FincasGanadero, ClienteFincaTrabajador]),
    AuthClientesModule,
  ],
  providers: [ClienteFincaTrabajadorService],
})
export class ClienteFincaTrabajadorModule {}
