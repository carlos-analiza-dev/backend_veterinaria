import { Module } from '@nestjs/common';
import { IngresosService } from './ingresos.service';
import { IngresosController } from './ingresos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [IngresosController],
  imports: [
    TypeOrmModule.forFeature([
      Ingreso,
      FincasGanadero,
      Cliente,
      EspecieAnimal,
      RazaAnimal,
    ]),
    AuthClientesModule,
  ],
  providers: [IngresosService],
})
export class IngresosModule {}
