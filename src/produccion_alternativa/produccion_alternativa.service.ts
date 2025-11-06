import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduccionAlternativa } from './entities/produccion_alternativa.entity';
import { CreateProduccionAlternativaDto } from './dto/create-produccion_alternativa.dto';
import { UpdateProduccionAlternativaDto } from './dto/update-produccion_alternativa.dto';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Injectable()
export class ProduccionAlternativaService {
  constructor(
    @InjectRepository(ProduccionAlternativa)
    private readonly alternativaRepo: Repository<ProduccionAlternativa>,
    @InjectRepository(ProduccionFinca)
    private readonly produccionFincaRepo: Repository<ProduccionFinca>,
  ) {}

  async create(createDto: CreateProduccionAlternativaDto) {
    const { produccionFincaId, actividades } = createDto;

    const produccion = await this.produccionFincaRepo.findOne({
      where: { id: produccionFincaId },
    });
    if (!produccion) {
      throw new NotFoundException(
        'No se encontró la producción de finca asociada',
      );
    }

    const nuevaAlternativa = this.alternativaRepo.create({
      actividades,
      produccionFinca: produccion,
    });

    const alternativaGuardada = await this.alternativaRepo.save(
      nuevaAlternativa,
    );

    produccion.alternativa = alternativaGuardada;
    await this.produccionFincaRepo.save(produccion);

    return alternativaGuardada;
  }

  async findAll() {
    return await this.alternativaRepo.find({
      relations: ['produccionFinca'],
    });
  }

  async findOne(id: string) {
    const alternativa = await this.alternativaRepo.findOne({
      where: { id },
      relations: ['produccionFinca'],
    });

    if (!alternativa) {
      throw new NotFoundException('Producción alternativa no encontrada');
    }

    return alternativa;
  }

  async update(id: string, updateDto: UpdateProduccionAlternativaDto) {
    const alternativa = await this.alternativaRepo.findOne({ where: { id } });
    if (!alternativa) {
      throw new NotFoundException('Producción alternativa no encontrada');
    }

    Object.assign(alternativa, updateDto);
    return await this.alternativaRepo.save(alternativa);
  }

  async remove(id: string) {
    const alternativa = await this.alternativaRepo.findOne({ where: { id } });
    if (!alternativa) {
      throw new NotFoundException('Producción alternativa no encontrada');
    }

    await this.alternativaRepo.remove(alternativa);
    return { message: 'Producción alternativa eliminada correctamente' };
  }
}
