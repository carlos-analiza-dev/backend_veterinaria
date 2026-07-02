import { Module } from '@nestjs/common';
import { SanidadAnimalService } from './sanidad_animal.service';
import { SanidadAnimalController } from './sanidad_animal.controller';

@Module({
  controllers: [SanidadAnimalController],
  providers: [SanidadAnimalService],
})
export class SanidadAnimalModule {}
