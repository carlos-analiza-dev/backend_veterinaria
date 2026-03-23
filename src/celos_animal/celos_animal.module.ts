import { Module } from '@nestjs/common';
import { CelosAnimalService } from './celos_animal.service';
import { CelosAnimalController } from './celos_animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CelosAnimal } from './entities/celos_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import { CelosRegularService } from './celos-regular.service';
import { CelosAnimalValidationService } from './celos-animal-validation.service';

@Module({
  controllers: [CelosAnimalController],
  imports: [
    TypeOrmModule.forFeature([CelosAnimal, AnimalFinca, ServicioReproductivo]),
    AuthClientesModule,
  ],
  providers: [
    CelosAnimalService,
    CelosRegularService,
    CelosAnimalValidationService,
  ],
})
export class CelosAnimalModule {}
