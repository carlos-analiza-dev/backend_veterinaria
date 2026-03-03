import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePesoEsperadoRazaDto } from './dto/create-peso_esperado_raza.dto';
import { UpdatePesoEsperadoRazaDto } from './dto/update-peso_esperado_raza.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PesoEsperadoRaza } from './entities/peso_esperado_raza.entity';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { CalcularRangoPesoDto } from './dto/calcular-rango-peso';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';

@Injectable()
export class PesoEsperadoRazaService {
  constructor(
    @InjectRepository(PesoEsperadoRaza)
    private readonly pesoEsperadoRepo: Repository<PesoEsperadoRaza>,
    @InjectRepository(AnimalFinca)
    private readonly animalRepo: Repository<AnimalFinca>,
    @InjectRepository(RazaAnimal)
    private readonly razaAnimalRepo: Repository<RazaAnimal>,
  ) {}

  async create(dto: CreatePesoEsperadoRazaDto) {
    const {
      razaId,
      edadMaxMeses,
      edadMinMeses,
      pesoEsperadoMax,
      pesoEsperadoMin,
    } = dto;

    if (edadMinMeses >= edadMaxMeses) {
      throw new BadRequestException(
        'Edad Minima debe ser menor que Edad Maxima',
      );
    }

    if (pesoEsperadoMin >= pesoEsperadoMax) {
      throw new BadRequestException(
        'Peso Minimo Esperado debe ser menor que Peso Maximo Esperado',
      );
    }

    const raza = await this.razaAnimalRepo.findOne({
      where: { id: razaId },
    });

    if (!raza)
      throw new NotFoundException('No se encontró la raza seleccionada');

    const rangoExistente = await this.pesoEsperadoRepo.findOne({
      where: {
        raza: { id: razaId },
        edadMinMeses: LessThanOrEqual(edadMaxMeses),
        edadMaxMeses: MoreThanOrEqual(edadMinMeses),
      },
    });

    if (rangoExistente) {
      throw new BadRequestException(
        'El rango de edad se cruza con otro existente',
      );
    }

    const nuevo = this.pesoEsperadoRepo.create({
      raza,
      edadMaxMeses,
      edadMinMeses,
      pesoEsperadoMax,
      pesoEsperadoMin,
    });

    await this.pesoEsperadoRepo.save(nuevo);

    return {
      message: 'Peso esperado creado con éxito',
      data: nuevo,
    };
  }

  async calcularRangoPeso(dto: CalcularRangoPesoDto) {
    const { animalId, edadMeses } = dto;
    try {
      const animal = await this.animalRepo.findOne({ where: { id: animalId } });
      if (!animal)
        throw new NotFoundException(
          'No se encontraron resultados para el animal',
        );

      const razaId = animal.razas[0].id;

      const rango = await this.pesoEsperadoRepo.findOne({
        where: {
          raza: { id: razaId },
          edadMinMeses: LessThanOrEqual(edadMeses),
          edadMaxMeses: MoreThanOrEqual(edadMeses),
        },
      });

      if (!rango) {
        throw new NotFoundException(
          'No existe rango definido para esa edad en esta raza',
        );
      }

      return {
        raza: animal.razas[0].nombre,
        edadConsultada: edadMeses,
        rangoEdad: `${rango.edadMinMeses} - ${rango.edadMaxMeses} meses`,
        pesoMinimoEsperado: Number(rango.pesoEsperadoMin),
        pesoMaximoEsperado: Number(rango.pesoEsperadoMax),
      };
    } catch (error) {
      throw error;
    }
  }

  async findByRaza(razaId: string) {
    try {
      const pesoByRaza = await this.pesoEsperadoRepo.find({
        where: { raza: { id: razaId } },
      });
      if (!pesoByRaza || pesoByRaza.length === 0) {
        throw new NotFoundException(
          'No se encontraron pesos esperados para esta raza',
        );
      }

      return pesoByRaza;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await this.pesoEsperadoRepo.find({
      relations: ['raza'],
      order: {
        edadMinMeses: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const peso = await this.pesoEsperadoRepo.findOne({
      where: { id },
      relations: ['raza'],
    });

    if (!peso)
      throw new NotFoundException('Registro de peso esperado no encontrado');

    return peso;
  }

  async update(id: string, dto: UpdatePesoEsperadoRazaDto) {
    const peso = await this.findOne(id);

    if (dto.edadMinMeses && dto.edadMaxMeses) {
      if (dto.edadMinMeses >= dto.edadMaxMeses) {
        throw new BadRequestException(
          'edadMinMeses debe ser menor que edadMaxMeses',
        );
      }
    }

    if (dto.pesoEsperadoMin && dto.pesoEsperadoMax) {
      if (dto.pesoEsperadoMin >= dto.pesoEsperadoMax) {
        throw new BadRequestException(
          'pesoEsperadoMin debe ser menor que pesoEsperadoMax',
        );
      }
    }

    Object.assign(peso, dto);

    await this.pesoEsperadoRepo.save(peso);

    return {
      message: 'Peso esperado actualizado correctamente',
      data: peso,
    };
  }
}
