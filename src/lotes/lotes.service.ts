import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

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
    return await this.loteRepo.find({
      select: ['id', 'id_compra', 'id_sucursal', 'id_producto', 'cantidad', 'costo'],
      order: { id: 'DESC' },
    });
  }

  async findByProducto(id_producto: string) {
    return await this.loteRepo.find({
      where: { id_producto },
      select: ['id', 'id_compra', 'id_sucursal', 'id_producto', 'cantidad', 'costo'],
      order: { id: 'ASC' }, // FIFO - más antiguos primero
    });
  }

  async findBySucursal(id_sucursal: string) {
    return await this.loteRepo.find({
      where: { id_sucursal },
      select: ['id', 'id_compra', 'id_sucursal', 'id_producto', 'cantidad', 'costo'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string) {
    const lote = await this.loteRepo.findOne({
      where: { id },
      select: ['id', 'id_compra', 'id_sucursal', 'id_producto', 'cantidad', 'costo'],
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

  // Consultar existencias totales por producto
  async getExistenciasByProducto(id_producto: string, id_sucursal?: string) {
    const whereCondition: any = { id_producto };
    if (id_sucursal) {
      whereCondition.id_sucursal = id_sucursal;
    }

    const lotes = await this.loteRepo.find({
      where: whereCondition,
      select: ['id', 'id_compra', 'id_sucursal', 'id_producto', 'cantidad', 'costo'],
      order: { id: 'ASC' }, // FIFO
    });

    const totalExistencia = lotes.reduce((total, lote) => {
      return total + Number(lote.cantidad);
    }, 0);

    return {
      id_producto: id_producto,
      id_sucursal: id_sucursal || null,
      totalExistencia,
      lotes: lotes.map(lote => ({
        id: lote.id,
        id_compra: lote.id_compra,
        cantidad: lote.cantidad,
        costo: lote.costo,
      })),
    };
  }

  // Reducir inventario usando FIFO (lote más antiguo primero)
  async reducirInventario(id_producto: string, id_sucursal: string, cantidadSolicitada: number) {
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
        `No hay suficiente inventario. Faltaron ${cantidadPendiente} unidades.`
      );
    }

    return {
      message: `Se redujeron ${cantidadSolicitada} unidades del inventario`,
      lotesAfectados,
    };
  }
}