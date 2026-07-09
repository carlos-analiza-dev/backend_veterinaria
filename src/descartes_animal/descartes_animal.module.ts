import { Module } from '@nestjs/common';
import { DescartesAnimalService } from './descartes_animal.service';
import { DescartesAnimalController } from './descartes_animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthClientesModule } from 'src/auth-clientes/auth-clientes.module';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { DescartesAnimal } from './entities/descartes_animal.entity';

@Module({
  controllers: [DescartesAnimalController],
  imports: [
    TypeOrmModule.forFeature([DescartesAnimal, AnimalFinca, Cliente]),
    AuthClientesModule,
  ],
  providers: [DescartesAnimalService],
})
export class DescartesAnimalModule {}
