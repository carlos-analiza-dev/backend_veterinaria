import { Module } from '@nestjs/common';
import { PartoAnimalService } from './parto_animal.service';
import { PartoAnimalController } from './parto_animal.controller';

@Module({
  controllers: [PartoAnimalController],
  providers: [PartoAnimalService],
})
export class PartoAnimalModule {}
