import { Module } from '@nestjs/common';
import { AlimentacionAnimalService } from './alimentacion_animal.service';
import { AlimentacionAnimalController } from './alimentacion_animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlimentacionAnimal } from './entities/alimentacion_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [AlimentacionAnimalController],
  imports: [
    TypeOrmModule.forFeature([AlimentacionAnimal, AnimalFinca]),
    AuthClientesModule,
  ],
  providers: [AlimentacionAnimalService],
})
export class AlimentacionAnimalModule {}
