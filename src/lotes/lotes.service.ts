import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepo: Repository<Lote>,
  ) {}

  async create(createLoteDto: CreateLoteDto) {
    const lote = this.loteRepo.create(createLoteDto);
    return await this.loteRepo.save(lote);
  }

  async findAll() {
    return await this.loteRepo
      .createQueryBuilder('lote')
      .where('lote.id_producto IS NOT NULL')
      .andWhere('lote.id_sucursal IS NOT NULL')
      .andWhere('lote.id_compra IS NOT NULL')
      .select([
        'lote.id',
        'lote.id_compra',
        'lote.id_sucursal',
        'lote.id_producto',
        'lote.cantidad',
        'lote.costo',
      ])
      .orderBy('lote.id', 'DESC')
      .getMany();
  }

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

  async findBySucursal(id_sucursal: string) {
    return await this.loteRepo.find({
      where: { id_sucursal },
      select: [
        'id',
        'id_compra',
        'id_sucursal',
        'id_producto',
        'cantidad',
        'costo',
      ],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string) {
    const lote = await this.loteRepo.findOne({
      where: { id },
      select: [
        'id',
        'id_compra',
        'id_sucursal',
        'id_producto',
        'cantidad',
        'costo',
      ],
    });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }

    return lote;
  }

  async update(id: string, updateLoteDto: UpdateLoteDto) {
    const lote = await this.findOne(id);
    Object.assign(lote, updateLoteDto);
    return await this.loteRepo.save(lote);
  }

  async remove(id: string) {
    const lote = await this.findOne(id);
    return await this.loteRepo.remove(lote);
  }

  async getExistenciasByProducto(user: User, paginationDto: PaginationDto) {
    const paisId = user.pais.id;
    const { sucursal, producto, limit = 10, offset = 0 } = paginationDto;

    const query = this.loteRepo
      .createQueryBuilder('lote')
      .leftJoin('lote.producto', 'producto')
      .leftJoin('lote.sucursal', 'sucursal')
      .leftJoin('lote.compra', 'compra')
      .leftJoin('compra.pais', 'pais')
      .select('producto.id', 'productoId')
      .addSelect('producto.nombre', 'productoNombre')
      .addSelect('producto.codigo', 'codigo')
      .addSelect('producto.codigo_barra', 'codigo_barra')
      .addSelect('sucursal.id', 'sucursalId')
      .addSelect('sucursal.nombre', 'sucursalNombre')
      .addSelect('pais.id', 'paisId')
      .addSelect('pais.nombre', 'paisNombre')
      .addSelect('SUM(lote.cantidad)', 'existenciaTotal')
      .where('pais.id = :paisId', { paisId })
      .groupBy('producto.id')
      .addGroupBy('producto.nombre')
      .addGroupBy('sucursal.id')
      .addGroupBy('sucursal.nombre')
      .addGroupBy('pais.id')
      .addGroupBy('pais.nombre')
      .limit(limit)
      .offset(offset);

    if (sucursal) {
      query.andWhere('sucursal.id = :sucursalId', { sucursalId: sucursal });
    }

    if (producto) {
      query.andWhere('producto.id = :productoId', { productoId: producto });
    }

    return await query.getRawMany();
  }

  async getExistenciaPorProductoSucursal(
    id_producto: string,
    id_sucursal: string,
  ): Promise<number> {
    const resultado = await this.loteRepo
      .createQueryBuilder('lote')
      .select('SUM(lote.cantidad)', 'total')
      .where('lote.id_producto = :id_producto', { id_producto })
      .andWhere('lote.id_sucursal = :id_sucursal', { id_sucursal })
      .andWhere('lote.cantidad > 0')
      .getRawOne();

    return parseFloat(resultado.total) || 0;
  }

  // Reducir inventario usando FIFO (lote más antiguo primero)
  async reducirInventario(
    id_producto: string,
    id_sucursal: string,
    cantidadSolicitada: number,
  ) {
    const lotes = await this.loteRepo.find({
      where: { id_producto, id_sucursal },
      order: { id: 'ASC' }, // FIFO - primero el más antiguo
    });

    let cantidadPendiente = cantidadSolicitada;
    const lotesAfectados = [];

    for (const lote of lotes) {
      if (cantidadPendiente <= 0) break;
      if (lote.cantidad <= 0) continue;

      const cantidadARebajar = Math.min(cantidadPendiente, lote.cantidad);

      lote.cantidad = Number(lote.cantidad) - cantidadARebajar;
      cantidadPendiente -= cantidadARebajar;

      await this.loteRepo.save(lote);
      lotesAfectados.push({
        loteId: lote.id,
        cantidadRebajada: cantidadARebajar,
        cantidadRestante: lote.cantidad,
      });
    }

    if (cantidadPendiente > 0) {
      throw new NotFoundException(
        `No hay suficiente inventario. Faltaron ${cantidadPendiente} unidades.`,
      );
    }

    return {
      message: `Se redujeron ${cantidadSolicitada} unidades del inventario`,
      lotesAfectados,
    };
  }
}
