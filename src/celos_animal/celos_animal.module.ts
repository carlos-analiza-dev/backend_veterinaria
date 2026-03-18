import { Module } from '@nestjs/common';
import { CelosAnimalService } from './celos_animal.service';
import { CelosAnimalController } from './celos_animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CelosAnimal } from './entities/celos_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [CelosAnimalController],
  imports: [
    TypeOrmModule.forFeature([CelosAnimal, AnimalFinca]),
    AuthClientesModule,
  ],
  providers: [CelosAnimalService],
})
export class CelosAnimalModule {}
