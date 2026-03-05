import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePesoHistorialDto } from './dto/create-peso_historial.dto';
import { UpdatePesoHistorialDto } from './dto/update-peso_historial.dto';
import { PesoHistorial } from './entities/peso_historial.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';

@Injectable()
export class PesoHistorialService {
  constructor(
    @InjectRepository(PesoHistorial)
    private readonly pesoHistorialRepo: Repository<PesoHistorial>,

    @InjectRepository(AnimalFinca)
    private readonly animalRepo: Repository<AnimalFinca>,
  ) {}

  async create(dto: CreatePesoHistorialDto) {
    const { animalId, peso, observaciones, fecha } = dto;

    try {
      const animal = await this.animalRepo.findOne({
        where: { id: animalId },
        relations: ['pesos'],
      });

      if (!animal) {
        throw new NotFoundException('No se encontró el animal seleccionado');
      }

      const ultimoPeso = await this.pesoHistorialRepo.findOne({
        where: { animal: { id: animalId } },
        order: { fecha: 'DESC' },
      });

      let gananciaDiaria = 0;

      if (ultimoPeso) {
        const dias =
          (new Date(fecha).getTime() - new Date(ultimoPeso.fecha).getTime()) /
          (1000 * 60 * 60 * 24);

        if (dias <= 0) {
          throw new BadRequestException(
            'La fecha debe ser mayor al último registro',
          );
        }

        gananciaDiaria = (peso - Number(ultimoPeso.peso)) / dias;
      }

      const nuevo = this.pesoHistorialRepo.create({
        animal,
        peso,
        observaciones,
        fecha,
      });

      await this.pesoHistorialRepo.save(nuevo);

      return {
        message: 'Peso guardado con éxito',
        gananciaDiaria: Number(gananciaDiaria.toFixed(2)),
        data: nuevo,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await this.pesoHistorialRepo.find({
      relations: ['animal'],
      order: { fecha: 'DESC' },
    });
  }

  async findAllPesoByAnimal(id: string) {
    try {
      const animalExiste = await this.animalRepo.findOne({ where: { id } });
      if (!animalExiste)
        throw new NotFoundException('No existe el animal seleccionado');
      const pesoAnimal = await this.pesoHistorialRepo.find({
        where: { animal: { id } },
      });
      if (!pesoAnimal || pesoAnimal.length === 0) {
        throw new NotFoundException(
          'No se obtuvo historial de peso para este animal',
        );
      }
      return pesoAnimal;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const registro = await this.pesoHistorialRepo.findOne({
      where: { id },
      relations: ['animal'],
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    return registro;
  }

  async findByAnimal(animalId: string) {
    const animal = await this.animalRepo.findOne({
      where: { id: animalId },
    });

    if (!animal) {
      throw new NotFoundException('Animal no encontrado');
    }

    return await this.pesoHistorialRepo.find({
      where: { animal: { id: animalId } },
      order: { fecha: 'ASC' },
    });
  }

  async update(id: string, dto: UpdatePesoHistorialDto) {
    const registro = await this.findOne(id);

    Object.assign(registro, {
      ...dto,
      fecha: dto.fecha ? new Date(dto.fecha) : registro.fecha,
    });

    await this.pesoHistorialRepo.save(registro);

    return {
      message: 'Registro actualizado correctamente',
      data: registro,
    };
  }

  async remove(id: string) {
    const registro = await this.findOne(id);

    await this.pesoHistorialRepo.remove(registro);

    return {
      message: 'Registro eliminado correctamente',
    };
  }
}
