import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduccionGanadera } from './entities/produccion_ganadera.entity';
import { ProduccionGanaderaDto } from './dto/create-produccion_ganadera.dto';
import { UpdateProduccionGanaderaDto } from './dto/update-produccion_ganadera.dto';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Injectable()
export class ProduccionGanaderaService {
  constructor(
    @InjectRepository(ProduccionGanadera)
    private readonly ganaderaRepo: Repository<ProduccionGanadera>,
    @InjectRepository(ProduccionFinca)
    private readonly produccionRepo: Repository<ProduccionFinca>,
  ) {}

  async create(
    createDto: ProduccionGanaderaDto & { produccionFincaId: string },
  ) {
    const { produccionFincaId, ...data } = createDto;

    const produccion = await this.produccionRepo.findOne({
      where: { id: produccionFincaId },
    });

    if (!produccion) {
      throw new NotFoundException('No se encontró la producción seleccionada');
    }

    const ganadera = this.ganaderaRepo.create({
      ...data,
      produccionFinca: produccion,
    });

    const ganaderaGuardada = await this.ganaderaRepo.save(ganadera);

    produccion.ganadera = ganaderaGuardada;
    await this.produccionRepo.save(produccion);

    return ganaderaGuardada;
  }

  async findAll() {
    return await this.ganaderaRepo.find();
  }

  async findOne(id: string) {
    const found = await this.ganaderaRepo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(
        `Producción ganadera con id ${id} no encontrada`,
      );
    }
    return found;
  }

  async update(id: string, updateDto: UpdateProduccionGanaderaDto) {
    const ganadera = await this.findOne(id);
    Object.assign(ganadera, updateDto);
    return await this.ganaderaRepo.save(ganadera);
  }

  async remove(id: string) {
    const ganadera = await this.findOne(id);
    await this.ganaderaRepo.remove(ganadera);
    return { message: `Producción ganadera ${id} eliminada correctamente` };
  }
}
