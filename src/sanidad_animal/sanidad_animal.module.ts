import { Module } from '@nestjs/common';
import { SanidadAnimalService } from './sanidad_animal.service';
import { SanidadAnimalController } from './sanidad_animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SanidadAnimal } from './entities/sanidad_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Module({
  controllers: [SanidadAnimalController],
  imports: [
    TypeOrmModule.forFeature([SanidadAnimal, AnimalFinca, Cliente]),
    AuthClientesModule,
  ],
  providers: [SanidadAnimalService],
})
export class SanidadAnimalModule {}
