import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEspecieAnimalDto } from './dto/create-especie_animal.dto';
import { UpdateEspecieAnimalDto } from './dto/update-especie_animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EspecieAnimal } from './entities/especie_animal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EspecieAnimalService {
  constructor(
    @InjectRepository(EspecieAnimal)
    private readonly especieRepo: Repository<EspecieAnimal>,
  ) {}

  async findAll() {
    try {
      const especies = await this.especieRepo.find({});
      if (!especies || especies.length === 0)
        throw new NotFoundException(
          'No se encontraron especies disponibles en este momento',
        );
      return especies;
    } catch (error) {
      throw error;
    }
  }
}
