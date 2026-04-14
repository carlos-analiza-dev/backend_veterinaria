import { Module } from '@nestjs/common';
import { PartoAnimalService } from './parto_animal.service';
import { PartoAnimalController } from './parto_animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartoAnimal } from './entities/parto_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { ServicioReproductivo } from 'src/servicios_reproductivos/entities/servicios_reproductivo.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { PartoAnimalValidationService } from './parto_animal.validation.service';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [PartoAnimalController],
  imports: [
    TypeOrmModule.forFeature([
      PartoAnimal,
      AnimalFinca,
      ServicioReproductivo,
      CelosAnimal,
      Cliente,
    ]),
    AuthClientesModule,
  ],
  providers: [PartoAnimalService, PartoAnimalValidationService],
})
export class PartoAnimalModule {}
