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

  async create(createDto: CreateEspecieAnimalDto) {
    try {
      const existingEspecie = await this.especieRepo.findOne({
        where: { nombre: createDto.nombre },
      });

      if (existingEspecie) {
        throw new BadRequestException(
          `Ya existe una especie con el nombre: ${createDto.nombre}`,
        );
      }

      const especie = this.especieRepo.create(createDto);
      return await this.especieRepo.save(especie);
    } catch (error) {
      throw error;
    }
  }

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

  async findOne(id: string) {
    try {
      const especie = await this.especieRepo.findOne({
        where: { id },
        relations: ['animales', 'razas'],
      });

      if (!especie) {
        throw new NotFoundException(`Especie con ID ${id} no encontrada`);
      }

      return especie;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateEspecieAnimalDto) {
    try {
      const especie = await this.findOne(id);

      if (updateDto.nombre && updateDto.nombre !== especie.nombre) {
        const existingEspecie = await this.especieRepo.findOne({
          where: { nombre: updateDto.nombre },
        });

        if (existingEspecie) {
          throw new BadRequestException(
            `Ya existe una especie con el nombre: ${updateDto.nombre}`,
          );
        }
      }

      this.especieRepo.merge(especie, updateDto);
      return await this.especieRepo.save(especie);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const especie = await this.findOne(id);

      especie.isActive = false;
      return await this.especieRepo.save(especie);
    } catch (error) {
      throw error;
    }
  }

  async restore(id: string) {
    try {
      const especie = await this.especieRepo.findOne({
        where: { id },
      });

      if (!especie) {
        throw new NotFoundException(`Especie con ID ${id} no encontrada`);
      }

      especie.isActive = true;
      return await this.especieRepo.save(especie);
    } catch (error) {
      throw error;
    }
  }
}
