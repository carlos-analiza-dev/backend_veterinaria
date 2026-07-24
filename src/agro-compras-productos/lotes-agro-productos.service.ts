import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoteAgroProducto } from './entities/lote-agro-compra.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LotesAgroProductosService {
  constructor(
    @InjectRepository(LoteAgroProducto)
    private readonly loteRepo: Repository<LoteAgroProducto>,
  ) {}

  async findByProducto(id_producto: string) {
    const lotes = await this.loteRepo.find({
      where: { id_producto },
      relations: ['compra', 'sucursal', 'producto'],
      order: { created_at: 'ASC' },
    });

    if (!lotes || lotes.length === 0) {
      throw new NotFoundException(
        `No se encontraron lotes para el producto con ID: ${id_producto}`,
      );
    }

    return lotes;
  }
}
