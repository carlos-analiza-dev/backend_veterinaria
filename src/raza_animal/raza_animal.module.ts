import { Module } from '@nestjs/common';
import { RazaAnimalService } from './raza_animal.service';
import { RazaAnimalController } from './raza_animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazaAnimal } from './entities/raza_animal.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { PesoEsperadoRaza } from 'src/peso_esperado_raza/entities/peso_esperado_raza.entity';
import { GananciaPesoRaza } from 'src/ganancia_peso_raza/entities/ganancia_peso_raza.entity';

@Module({
  controllers: [RazaAnimalController],
  imports: [
    TypeOrmModule.forFeature([
      RazaAnimal,
      EspecieAnimal,
      AnimalFinca,
      PesoEsperadoRaza,
      GananciaPesoRaza,
    ]),
  ],
  providers: [RazaAnimalService],
})
export class RazaAnimalModule {}
