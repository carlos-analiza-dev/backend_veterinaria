import { Module } from '@nestjs/common';
import { GananciaPesoRazaService } from './ganancia_peso_raza.service';
import { GananciaPesoRazaController } from './ganancia_peso_raza.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GananciaPesoRaza } from './entities/ganancia_peso_raza.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';

@Module({
  controllers: [GananciaPesoRazaController],
  imports: [
    TypeOrmModule.forFeature([GananciaPesoRaza, Cliente, RazaAnimal]),
    AuthClientesModule,
  ],
  providers: [GananciaPesoRazaService],
})
export class GananciaPesoRazaModule {}
