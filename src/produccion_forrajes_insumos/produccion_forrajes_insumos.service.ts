import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduccionForrajesInsumo } from './entities/produccion_forrajes_insumo.entity';
import { CreateProduccionForrajesInsumoDto } from './dto/create-produccion_forrajes_insumo.dto';
import { UpdateProduccionForrajesInsumoDto } from './dto/update-produccion_forrajes_insumo.dto';
import { ProduccionFinca } from 'src/produccion_finca/entities/produccion_finca.entity';

@Injectable()
export class ProduccionForrajesInsumosService {
  constructor(
    @InjectRepository(ProduccionForrajesInsumo)
    private readonly forrajesRepo: Repository<ProduccionForrajesInsumo>,
    @InjectRepository(ProduccionFinca)
    private readonly produccionRepo: Repository<ProduccionFinca>,
  ) {}

  async create(
    createDto: CreateProduccionForrajesInsumoDto & {
      produccionFincaId: string;
    },
  ) {
    const { produccionFincaId, ...data } = createDto;

    const produccion = await this.produccionRepo.findOne({
      where: { id: produccionFincaId },
    });

    if (!produccion) {
      throw new NotFoundException('No se encontró la producción seleccionada');
    }

    const forrajes = this.forrajesRepo.create({
      ...data,
      produccionFinca: produccion,
    });

    const forrajesGuardada = await this.forrajesRepo.save(forrajes);

    produccion.forrajesInsumo = forrajesGuardada;
    await this.produccionRepo.save(produccion);

    return forrajesGuardada;
  }

  async findAll() {
    return await this.forrajesRepo.find();
  }

  async findOne(id: string) {
    const found = await this.forrajesRepo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(
        `ProduccionForrajesInsumo con id ${id} no encontrada`,
      );
    }
    return found;
  }

  async update(id: string, updateDto: UpdateProduccionForrajesInsumoDto) {
    const forraje = await this.findOne(id);
    const updated = Object.assign(forraje, updateDto);
    return await this.forrajesRepo.save(updated);
  }

  async remove(id: string) {
    const forraje = await this.findOne(id);
    await this.forrajesRepo.remove(forraje);
    return {
      message: `ProduccionForrajesInsumo ${id} eliminada correctamente`,
    };
  }
}
