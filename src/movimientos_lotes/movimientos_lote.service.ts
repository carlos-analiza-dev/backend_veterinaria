import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientosLote } from './entities/movimientos_lote.entity';
import { CreateMovimientosLoteDto } from './dto/create-movimientos.dto';
import { UpdateMovimientosLoteDto } from './dto/update-movimientos.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class MovimientosLoteService {
  constructor(
    @InjectRepository(MovimientosLote)
    private readonly movimientosRepository: Repository<MovimientosLote>,
  ) {}

  async create(createDto: CreateMovimientosLoteDto) {
    const movimiento = this.movimientosRepository.create(createDto);
    return await this.movimientosRepository.save(movimiento);
  }

  async findAll(sucursalId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, fechaInicio, fechaFin } = paginationDto;

    const query = this.movimientosRepository
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.lote', 'lote')
      .leftJoinAndSelect('movimiento.factura', 'factura')
      .leftJoinAndSelect('movimiento.producto', 'producto')
      .where('factura.sucursal_id = :sucursalId', { sucursalId })
      .orderBy('movimiento.fecha', 'DESC')
      .take(limit)
      .skip(offset);

    if (fechaInicio && fechaFin) {
      query.andWhere(
        'DATE(movimiento.fecha) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)',
        { fechaInicio, fechaFin },
      );
    } else if (fechaInicio) {
      query.andWhere('DATE(movimiento.fecha) >= DATE(:fechaInicio)', {
        fechaInicio,
      });
    } else if (fechaFin) {
      query.andWhere('DATE(movimiento.fecha) <= DATE(:fechaFin)', {
        fechaFin,
      });
    }

    const [data, total] = await query.getManyAndCount();

    if (!data || data.length === 0) {
      throw new NotFoundException('No se encontraron movimientos');
    }

    return {
      total,
      data,
    };
  }

  async findOne(id: string) {
    const movimiento = await this.movimientosRepository.findOne({
      where: { id },
      relations: ['lote', 'factura', 'producto'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }

    return movimiento;
  }

  async update(id: string, updateDto: UpdateMovimientosLoteDto) {
    const movimiento = await this.movimientosRepository.preload({
      id,
      ...updateDto,
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }

    return await this.movimientosRepository.save(movimiento);
  }

  async remove(id: string) {
    const movimiento = await this.findOne(id);
    return await this.movimientosRepository.remove(movimiento);
  }
}
