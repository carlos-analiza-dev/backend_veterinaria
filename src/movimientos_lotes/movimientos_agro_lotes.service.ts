import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AgroMovimientosLote } from './entities/agro_movimientos_lotes.entity';
import { Repository } from 'typeorm';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';

@Injectable()
export class MovimientosAgroLoteService {
  constructor(
    @InjectRepository(AgroMovimientosLote)
    private readonly movimientosRepository: Repository<AgroMovimientosLote>,
    private readonly validationAgro: AgroservicioValidationService,
  ) {}

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;
    const {
      limit = 10,
      offset = 0,
      fechaInicio,
      fechaFin,
      sucursal,
    } = paginationDto;

    const query = this.movimientosRepository
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.lote', 'lote')
      .leftJoinAndSelect('lote.sucursal', 'sucursal')
      .leftJoinAndSelect('movimiento.factura', 'factura')
      .leftJoinAndSelect('factura.agroservicio', 'agroservicio')
      .leftJoinAndSelect('movimiento.producto', 'producto')
      .where('factura.agroservicioId = :agroservicioId', { agroservicioId })
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

    if (sucursal) {
      query.andWhere('factura.sucursal_id = :sucursalId', {
        sucursalId: sucursal,
      });
    }

    const [data, total] = await query.getManyAndCount();

    if (!data || data.length === 0) {
      throw new NotFoundException('No se encontraron movimientos');
    }

    return {
      total,
      movimientos: data,
    };
  }
}
