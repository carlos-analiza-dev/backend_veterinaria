import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvLoteAgroInsumo } from './entities/inv-lote-agro-insumo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LotesAgroInsumosService {
  constructor(
    @InjectRepository(InvLoteAgroInsumo)
    private readonly invLoteRepo: Repository<InvLoteAgroInsumo>,
  ) {}
  async obtenerCantidadPorSucursal(sucursalId: string, insumoId: string) {
    const query = this.invLoteRepo
      .createQueryBuilder('lote')
      .leftJoin('lote.sucursal', 'sucursal')
      .leftJoin('lote.insumo', 'insumo')
      .select('sucursal.id', 'sucursalId')
      .addSelect('sucursal.nombre', 'sucursal')
      .addSelect('insumo.id', 'insumoId')
      .addSelect('insumo.nombre', 'insumo')
      .addSelect('SUM(lote.cantidad)', 'cantidad')
      .addSelect('SUM(lote.costo)', 'costoTotal')
      .where('sucursal.id = :sucursalId', { sucursalId })
      .andWhere('insumo.id = :insumoId', { insumoId })
      .groupBy('sucursal.id')
      .addGroupBy('sucursal.nombre')
      .addGroupBy('insumo.id')
      .addGroupBy('insumo.nombre');

    const resultado = await query.getRawOne();

    if (!resultado) {
      return {
        sucursalId,
        insumoId,
        cantidad: 0,
        costoTotal: 0,
      };
    }

    return { cantidad: Number(resultado.cantidad) };
  }
}
