import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InsumosService {
  constructor(
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
  ) {}

  async create(createInsumoDto: CreateInsumoDto) {
    const insumo = this.insumoRepository.create(createInsumoDto);
    return await this.insumoRepository.save(insumo);
  }

  async findAll() {
    return await this.insumoRepository.find();
  }

  async findInsumosDisponibles() {
    try {
      const insumos_disponibles = await this.insumoRepository.find({
        where: { disponible: true },
      });
      if (!insumos_disponibles || insumos_disponibles.length === 0) {
        throw new NotFoundException(
          'No se encontraron insumos disponibles en este momento',
        );
      }
      return { insumos: insumos_disponibles };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const insumo = await this.insumoRepository.findOneBy({ id });
    if (!insumo)
      throw new NotFoundException(`insumo con ID ${id} no encontrado`);
    return insumo;
  }

  async update(id: string, updateInsumoDto: UpdateInsumoDto) {
    const insumo = await this.findOne(id);
    const actualizado = this.insumoRepository.merge(insumo, updateInsumoDto);
    return await this.insumoRepository.save(actualizado);
  }

  async remove(id: string): Promise<void> {
    const producto = await this.findOne(id);
    await this.insumoRepository.remove(producto);
  }
}
