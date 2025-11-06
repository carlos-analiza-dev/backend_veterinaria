import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduccionApicultura } from './entities/produccion_apicultura.entity';
import { CreateProduccionApiculturaDto } from './dto/create-produccion_apicultura.dto';
import { UpdateProduccionApiculturaDto } from './dto/update-produccion_apicultura.dto';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Injectable()
export class ProduccionApiculturaService {
  constructor(
    @InjectRepository(ProduccionApicultura)
    private readonly apiculturaRepo: Repository<ProduccionApicultura>,
    @InjectRepository(ProduccionFinca)
    private readonly produccionRepo: Repository<ProduccionFinca>,
  ) {}

  async create(
    createDto: CreateProduccionApiculturaDto & { produccionFincaId: string },
  ) {
    const { produccionFincaId, ...data } = createDto;

    const produccion = await this.produccionRepo.findOne({
      where: { id: produccionFincaId },
    });
    if (!produccion) {
      throw new NotFoundException('No se encontró la producción seleccionada');
    }

    const apicultura = this.apiculturaRepo.create({
      ...data,
      produccionFinca: produccion,
    });

    const apiculturaGuardada = await this.apiculturaRepo.save(apicultura);

    produccion.apicultura = apiculturaGuardada;
    await this.produccionRepo.save(produccion);

    return apiculturaGuardada;
  }

  async findAll() {
    return await this.apiculturaRepo.find({
      relations: ['produccionFinca'],
    });
  }

  async findOne(id: string) {
    const apicultura = await this.apiculturaRepo.findOne({
      where: { id },
      relations: ['produccionFinca'],
    });
    if (!apicultura) {
      throw new NotFoundException(
        `Producción apícola con ID ${id} no encontrada`,
      );
    }
    return apicultura;
  }

  async update(id: string, updateDto: UpdateProduccionApiculturaDto) {
    const apicultura = await this.findOne(id);
    Object.assign(apicultura, updateDto);
    return await this.apiculturaRepo.save(apicultura);
  }

  async remove(id: string) {
    const apicultura = await this.findOne(id);
    await this.apiculturaRepo.remove(apicultura);
    return {
      message: `Producción apícola con ID ${id} eliminada correctamente`,
    };
  }
}
