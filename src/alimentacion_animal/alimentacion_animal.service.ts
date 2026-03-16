import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlimentacionAnimalDto } from './dto/create-alimentacion_animal.dto';
import { UpdateAlimentacionAnimalDto } from './dto/update-alimentacion_animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlimentacionAnimal } from './entities/alimentacion_animal.entity';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { instanceToPlain } from 'class-transformer';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class AlimentacionAnimalService {
  constructor(
    @InjectRepository(AlimentacionAnimal)
    private alimentacionRepository: Repository<AlimentacionAnimal>,

    @InjectRepository(AnimalFinca)
    private animalRepository: Repository<AnimalFinca>,
  ) {}

  async create(dto: CreateAlimentacionAnimalDto) {
    try {
      const animal = await this.animalRepository.findOne({
        where: { id: dto.animalId },
      });

      if (!animal) {
        throw new NotFoundException('Animal no encontrado');
      }

      const alimento_exist = await this.alimentacionRepository.findOne({
        where: { animal: { id: dto.animalId }, tipoAlimento: dto.tipoAlimento },
      });
      if (alimento_exist)
        throw new BadRequestException(
          `Este animal ya tiene el alimento de tipo ${alimento_exist.tipoAlimento} asociado a su alimentacion`,
        );

      const alimentacion = this.alimentacionRepository.create({
        tipoAlimento: dto.tipoAlimento,
        origen: dto.origen,
        cantidad: dto.cantidad,
        unidad: dto.unidad,
        costo_diario: dto.costo_diario,
        fecha: dto.fecha,
        animal,
      });

      await this.alimentacionRepository.save(alimentacion);

      return 'Alimentación registrada con éxito';
    } catch (error) {
      throw error;
    }
  }

  async findAll(cliente: Cliente) {
    const propietarioId = cliente.id;

    try {
      const alimentacion = await this.alimentacionRepository
        .createQueryBuilder('alimentacion')
        .leftJoinAndSelect('alimentacion.animal', 'animal')
        .leftJoinAndSelect('animal.profileImages', 'profileImages')
        .leftJoin('animal.propietario', 'propietario')
        .where('propietario.id = :propietarioId', { propietarioId })
        .orderBy('animal.identificador', 'ASC')
        .addOrderBy('alimentacion.fecha', 'DESC')
        .getMany();

      if (!alimentacion || alimentacion.length === 0) {
        throw new NotFoundException(
          'No se encontró alimentación relacionada para este animal',
        );
      }

      const agrupadoPorAnimal = alimentacion.reduce((acc, registro) => {
        const animalId = registro.animal.id;

        if (!acc[animalId]) {
          acc[animalId] = {
            animal: instanceToPlain(registro.animal),
            alimentos: [],
          };
        }

        const { animal, ...datosAlimento } = registro;
        acc[animalId].alimentos.push(instanceToPlain(datosAlimento));

        return acc;
      }, {});

      const resultado = Object.values(agrupadoPorAnimal);
      return resultado;
    } catch (error) {
      throw error;
    }
  }

  async findByAnimal(animalId: string) {
    try {
      const animal_existe = await this.animalRepository.findOne({
        where: { id: animalId },
      });
      if (!animal_existe)
        throw new NotFoundException('No se encontro el animal seleccionado');
      const alimentacion = await this.alimentacionRepository.find({
        where: { animal: { id: animalId } },
      });
      if (!alimentacion || alimentacion.length === 0)
        throw new NotFoundException(
          'No se encontro alimentacion relacionada para este animal',
        );
      return alimentacion;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const alimentacion = await this.alimentacionRepository.findOne({
      where: { id },
      relations: ['animal'],
    });

    if (!alimentacion) {
      throw new NotFoundException('Registro de alimentación no encontrado');
    }

    return alimentacion;
  }

  async update(id: string, dto: UpdateAlimentacionAnimalDto) {
    try {
      const alimentacion = await this.findOne(id);

      if (dto.animalId) {
        const animal = await this.animalRepository.findOne({
          where: { id: dto.animalId },
        });

        if (!animal) {
          throw new NotFoundException('Animal no encontrado');
        }
      }

      const animalId = dto.animalId || alimentacion.animal.id;

      if (dto.tipoAlimento || dto.animalId) {
        const tipoAlimento = dto.tipoAlimento || alimentacion.tipoAlimento;

        const alimentoExistente = await this.alimentacionRepository
          .createQueryBuilder('alimentacion')
          .where('alimentacion.animalId = :animalId', { animalId })
          .andWhere('alimentacion.tipoAlimento = :tipoAlimento', {
            tipoAlimento,
          })
          .andWhere('alimentacion.id != :id', { id })
          .getOne();

        if (alimentoExistente) {
          throw new BadRequestException(
            `Este animal ya tiene el alimento de tipo ${tipoAlimento} asociado a su alimentación`,
          );
        }
      }

      if (dto.animalId) {
        const animal = await this.animalRepository.findOne({
          where: { id: dto.animalId },
        });
        alimentacion.animal = animal;
      }

      Object.assign(alimentacion, {
        ...(dto.tipoAlimento && { tipoAlimento: dto.tipoAlimento }),
        ...(dto.origen && { origen: dto.origen }),
        ...(dto.cantidad && { cantidad: dto.cantidad }),
        ...(dto.unidad && { unidad: dto.unidad }),
        ...(dto.costo_diario && { costo_diario: dto.costo_diario }),
        ...(dto.fecha && { fecha: dto.fecha }),
      });

      const alimentacionActualizada =
        await this.alimentacionRepository.save(alimentacion);

      return {
        message: 'Registro de alimentación actualizado con éxito',
        data: instanceToPlain(alimentacionActualizada),
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const alimentacion = await this.findOne(id);

    await this.alimentacionRepository.remove(alimentacion);

    return {
      message: 'Registro de alimentación eliminado',
    };
  }
}
