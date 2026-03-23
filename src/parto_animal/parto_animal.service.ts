import { Injectable } from '@nestjs/common';
import { CreatePartoAnimalDto } from './dto/create-parto_animal.dto';
import { UpdatePartoAnimalDto } from './dto/update-parto_animal.dto';

@Injectable()
export class PartoAnimalService {
  create(createPartoAnimalDto: CreatePartoAnimalDto) {
    return 'This action adds a new partoAnimal';
  }

  findAll() {
    return `This action returns all partoAnimal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} partoAnimal`;
  }

  update(id: number, updatePartoAnimalDto: UpdatePartoAnimalDto) {
    return `This action updates a #${id} partoAnimal`;
  }

  remove(id: number) {
    return `This action removes a #${id} partoAnimal`;
  }
}
