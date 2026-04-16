import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRazaAnimalDto } from './dto/create-raza_animal.dto';
import { UpdateRazaAnimalDto } from './dto/update-raza_animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { Repository } from 'typeorm';
import { RazaAnimal } from './entities/raza_animal.entity';

@Injectable()
export class RazaAnimalService {
  constructor(
    @InjectRepository(EspecieAnimal)
    private readonly especieRepo: Repository<EspecieAnimal>,
    @InjectRepository(RazaAnimal)
    private readonly razaRepo: Repository<RazaAnimal>,
  ) {}

  async create(createRazaAnimalDto: CreateRazaAnimalDto) {
    try {
      const especie = await this.especieRepo.findOne({
        where: { id: createRazaAnimalDto.especieId },
      });

      if (!especie) {
        throw new NotFoundException(
          `Especie con ID ${createRazaAnimalDto.especieId} no encontrada`,
        );
      }

      const existingRaza = await this.razaRepo.findOne({
        where: { nombre: createRazaAnimalDto.nombre },
      });

      if (existingRaza) {
        throw new BadRequestException(
          `Ya existe una raza con el nombre: ${createRazaAnimalDto.nombre}`,
        );
      }

      const raza = this.razaRepo.create({
        ...createRazaAnimalDto,
        especie: especie,
      });

      return await this.razaRepo.save(raza);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const razas = await this.razaRepo.find({
        relations: [
          'especie',
          'animales',
          'pesosEsperados',
          'gananciasPesoRaza',
        ],
      });

      if (!razas || razas.length === 0) {
        throw new NotFoundException(
          'No se encontraron razas disponibles en este momento',
        );
      }

      return razas;
    } catch (error) {
      throw error;
    }
  }

  async findAllByEspecie(especieId: string) {
    try {
      const especie = await this.especieRepo.findOne({
        where: { id: especieId },
      });

      if (!especie) {
        throw new NotFoundException(
          `No se encontró la especie seleccionada con ID: ${especieId}`,
        );
      }

      const razas = await this.razaRepo.find({
        where: {
          especie: { id: especieId },
        },
        relations: ['especie'],
      });

      if (!razas || razas.length === 0) {
        throw new NotFoundException(
          `No se encontraron razas disponibles para la especie: ${especie.nombre}`,
        );
      }

      return razas;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const raza = await this.razaRepo.findOne({
        where: { id },
      });

      if (!raza) {
        throw new NotFoundException(`Raza con ID ${id} no encontrada`);
      }

      return raza;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateRazaAnimalDto: UpdateRazaAnimalDto) {
    try {
      const raza = await this.findOne(id);

      if (updateRazaAnimalDto.especieId) {
        const especie = await this.especieRepo.findOne({
          where: { id: updateRazaAnimalDto.especieId },
        });

        if (!especie) {
          throw new NotFoundException(
            `Especie con ID ${updateRazaAnimalDto.especieId} no encontrada`,
          );
        }
        raza.especie = especie;
      }

      if (
        updateRazaAnimalDto.nombre &&
        updateRazaAnimalDto.nombre !== raza.nombre
      ) {
        const existingRaza = await this.razaRepo.findOne({
          where: { nombre: updateRazaAnimalDto.nombre },
        });

        if (existingRaza) {
          throw new BadRequestException(
            `Ya existe una raza con el nombre: ${updateRazaAnimalDto.nombre}`,
          );
        }
        raza.nombre = updateRazaAnimalDto.nombre;
      }

      if (updateRazaAnimalDto.abreviatura !== undefined) {
        raza.abreviatura = updateRazaAnimalDto.abreviatura;
      }
      if (updateRazaAnimalDto.isActive !== undefined) {
        raza.isActive = updateRazaAnimalDto.isActive;
      }

      return await this.razaRepo.save(raza);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const raza = await this.findOne(id);

      raza.isActive = false;
      return await this.razaRepo.save(raza);
    } catch (error) {
      throw error;
    }
  }

  async restore(id: string) {
    try {
      const raza = await this.razaRepo.findOne({
        where: { id },
      });

      if (!raza) {
        throw new NotFoundException(`Raza con ID ${id} no encontrada`);
      }

      raza.isActive = true;
      return await this.razaRepo.save(raza);
    } catch (error) {
      throw error;
    }
  }

  async hardRemove(id: string) {
    try {
      const raza = await this.findOne(id);
      return await this.razaRepo.remove(raza);
    } catch (error) {
      throw error;
    }
  }
}
