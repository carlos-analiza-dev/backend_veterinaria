import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMovimientosInventarioDto } from './dto/create-movimientos_inventario.dto';
import { UpdateMovimientosInventarioDto } from './dto/update-movimientos_inventario.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MovimientosInventario } from './entities/movimientos_inventario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MovimientosInventarioService {
  constructor(
    @InjectRepository(MovimientosInventario)
    private readonly movimientoInvRepository:Repository<MovimientosInventario>
  ){}
  create(createMovimientosInventarioDto: CreateMovimientosInventarioDto) {
    return 'This action adds a new movimientosInventario';
  }

async findAll(paginationDto: PaginationDto) {
  const {
    limit = 10,
    offset = 0,
    fechaInicio,
    fechaFin,
    sucursal,
  } = paginationDto;

  try {
    const queryBuilder = this.movimientoInvRepository
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.lote', 'lote')
      .leftJoinAndSelect('lote.producto', 'producto')
      .leftJoinAndSelect('movimiento.sucursalOrigen', 'sucursalOrigen')
      .leftJoinAndSelect('movimiento.sucursalDestino', 'sucursalDestino')
      .orderBy('movimiento.created_at', 'DESC')
      .take(limit)
      .skip(offset);

  
    if (fechaInicio && fechaFin) {
      queryBuilder.andWhere(
        'DATE(movimiento.created_at) BETWEEN :fechaInicio AND :fechaFin',
        {
          fechaInicio,
          fechaFin,
        },
      );
    } else if (fechaInicio) {
      queryBuilder.andWhere(
        'DATE(movimiento.created_at) >= :fechaInicio',
        {
          fechaInicio,
        },
      );
    } else if (fechaFin) {
      queryBuilder.andWhere(
        'DATE(movimiento.created_at) <= :fechaFin',
        {
          fechaFin,
        },
      );
    }

  
    if (sucursal) {
      queryBuilder.andWhere(
        `(movimiento.sucursal_origen_id = :sucursal 
          OR movimiento.sucursal_destino_id = :sucursal)`,
        { sucursal },
      );
    }

    const [movimientos, total] = await queryBuilder.getManyAndCount();

    return {
      total,
      limit,
      offset,
   movimientos: movimientos.map((movimiento) =>
    this.mappingMovimientos(movimiento),
  ),
    };
  } catch (error) {
    throw new InternalServerErrorException(
      'Error al obtener los movimientos de inventario',
    );
  }
}

private mappingMovimientos(movimiento: MovimientosInventario) {
  return {
    id: movimiento.id,
    tipo: movimiento.tipo,
    cantidad: movimiento.cantidad,
    created_at: movimiento.created_at,

    lote: movimiento.lote
      ? {
          id: movimiento.lote.id,
          producto: movimiento.lote.producto,
          cantidad: movimiento.lote.cantidad,
          costo: movimiento.lote.costo,
          costo_por_unidad: movimiento.lote.costo_por_unidad,
        }
      : null,

    sucursalOrigen: movimiento.sucursalOrigen
      ? {
          id: movimiento.sucursalOrigen.id,
          nombre: movimiento.sucursalOrigen.nombre,
          tipo: movimiento.sucursalOrigen.tipo,
          direccion_complemento:
            movimiento.sucursalOrigen.direccion_complemento,
        }
      : null,

    sucursalDestino: movimiento.sucursalDestino
      ? {
          id: movimiento.sucursalDestino.id,
          nombre: movimiento.sucursalDestino.nombre,
          tipo: movimiento.sucursalDestino.tipo,
          direccion_complemento:
            movimiento.sucursalDestino.direccion_complemento,
        }
      : null,
  };
}

  findOne(id: number) {
    return `This action returns a #${id} movimientosInventario`;
  }

  update(id: number, updateMovimientosInventarioDto: UpdateMovimientosInventarioDto) {
    return `This action updates a #${id} movimientosInventario`;
  }

  remove(id: number) {
    return `This action removes a #${id} movimientosInventario`;
  }
}
