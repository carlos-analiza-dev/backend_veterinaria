import { Controller, Get } from '@nestjs/common';
import { EspecieAnimalService } from './especie_animal.service';

@Controller('especie-animal')
export class EspecieAnimalController {
  constructor(private readonly especieAnimalService: EspecieAnimalService) {}

  @Get()
  findAll() {
    return this.especieAnimalService.findAll();
  }
}
