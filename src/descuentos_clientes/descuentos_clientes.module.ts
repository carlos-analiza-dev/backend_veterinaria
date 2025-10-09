import { Module } from '@nestjs/common';
import { DescuentosClientesService } from './descuentos_clientes.service';
import { DescuentosClientesController } from './descuentos_clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DescuentosCliente } from './entities/descuentos_cliente.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DescuentosClientesController],
  imports: [TypeOrmModule.forFeature([DescuentosCliente]), AuthModule],
  providers: [DescuentosClientesService],
})
export class DescuentosClientesModule {}
