import { Injectable } from '@nestjs/common';
import { CreateSanidadAnimalDto } from './dto/create-sanidad_animal.dto';
import { UpdateSanidadAnimalDto } from './dto/update-sanidad_animal.dto';

@Injectable()
export class SanidadAnimalService {
  create(createSanidadAnimalDto: CreateSanidadAnimalDto) {
    return 'This action adds a new sanidadAnimal';
  }

  findAll() {
    return `This action returns all sanidadAnimal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sanidadAnimal`;
  }

  update(id: number, updateSanidadAnimalDto: UpdateSanidadAnimalDto) {
    return `This action updates a #${id} sanidadAnimal`;
  }

  remove(id: number) {
    return `This action removes a #${id} sanidadAnimal`;
  }
}
