import { Module } from '@nestjs/common';
import { AnimalFincaService } from './animal_finca.service';
import { AnimalFincaController } from './animal_finca.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { AnimalFinca } from './entities/animal_finca.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [AnimalFincaController],
  imports: [
    TypeOrmModule.forFeature([
      AnimalFinca,
      FincasGanadero,
      EspecieAnimal,
      RazaAnimal,
      Cliente,
    ]),
  ],
  providers: [AnimalFincaService],
})
export class AnimalFincaModule {}
