import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduccionAgricola } from './entities/produccion_agricola.entity';
import { CreateProduccionAgricolaDto } from './dto/create-produccion_agricola.dto';
import { UpdateProduccionAgricolaDto } from './dto/update-produccion_agricola.dto';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Injectable()
export class ProduccionAgricolaService {
  constructor(
    @InjectRepository(ProduccionAgricola)
    private readonly produccionAgricolaRepo: Repository<ProduccionAgricola>,
    @InjectRepository(ProduccionFinca)
    private readonly produccionRepo: Repository<ProduccionFinca>,
  ) {}

  async create(
    createDto: CreateProduccionAgricolaDto & { produccionFincaId: string },
  ) {
    const { produccionFincaId, ...data } = createDto;

    const produccion = await this.produccionRepo.findOne({
      where: { id: produccionFincaId },
    });

    if (!produccion) {
      throw new NotFoundException('No se encontró la producción seleccionada');
    }

    const agricola = this.produccionAgricolaRepo.create({
      ...data,
      produccionFinca: produccion,
    });

    const agricolaGuardada = await this.produccionAgricolaRepo.save(agricola);

    produccion.agricola = agricolaGuardada;
    await this.produccionRepo.save(produccion);

    return agricolaGuardada;
  }

  async findAll() {
    return await this.produccionAgricolaRepo.find({
      relations: ['produccionFinca'],
    });
  }

  async findOne(id: string) {
    const produccion = await this.produccionAgricolaRepo.findOne({
      where: { id },
      relations: ['produccionFinca'],
    });
    if (!produccion) {
      throw new NotFoundException(
        `Producción agrícola con id ${id} no encontrada`,
      );
    }
    return produccion;
  }

  async update(
    id: string,
    updateProduccionAgricolaDto: UpdateProduccionAgricolaDto,
  ) {
    const produccion = await this.findOne(id);
    const actualizada = Object.assign(produccion, updateProduccionAgricolaDto);
    return await this.produccionAgricolaRepo.save(actualizada);
  }

  async remove(id: string) {
    const produccion = await this.findOne(id);
    await this.produccionAgricolaRepo.remove(produccion);
    return {
      message: `Producción agrícola con id ${id} eliminada correctamente`,
    };
  }
}
