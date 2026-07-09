import { Module } from '@nestjs/common';
import { MortalidadAnimalService } from './mortalidad_animal.service';
import { MortalidadAnimalController } from './mortalidad_animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MortalidadAnimal } from './entities/mortalidad_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';

@Module({
  controllers: [MortalidadAnimalController],
  imports: [
    TypeOrmModule.forFeature([MortalidadAnimal, AnimalFinca, Cliente]),
    AuthClientesModule,
  ],
  providers: [MortalidadAnimalService],
})
export class MortalidadAnimalModule {}
