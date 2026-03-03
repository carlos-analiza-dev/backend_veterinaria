import { Module } from '@nestjs/common';
import { PesoEsperadoRazaService } from './peso_esperado_raza.service';
import { PesoEsperadoRazaController } from './peso_esperado_raza.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PesoEsperadoRaza } from './entities/peso_esperado_raza.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';

@Module({
  controllers: [PesoEsperadoRazaController],
  imports: [
    TypeOrmModule.forFeature([PesoEsperadoRaza, RazaAnimal, AnimalFinca]),
  ],
  providers: [PesoEsperadoRazaService],
})
export class PesoEsperadoRazaModule {}
