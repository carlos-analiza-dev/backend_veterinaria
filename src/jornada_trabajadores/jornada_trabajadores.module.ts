import { Module } from '@nestjs/common';
import { JornadaTrabajadoresService } from './jornada_trabajadores.service';
import { JornadaTrabajadoresController } from './jornada_trabajadores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JornadaTrabajadore } from './entities/jornada_trabajadore.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [JornadaTrabajadoresController],
  imports: [
    TypeOrmModule.forFeature([JornadaTrabajadore, Cliente]),
    AuthClientesModule,
  ],
  providers: [JornadaTrabajadoresService],
})
export class JornadaTrabajadoresModule {}
