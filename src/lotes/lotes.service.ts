import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { MovimientosInventario } from 'src/movimientos_inventario/entities/movimientos_inventario.entity';
import { TipoMovimientoInventario } from 'src/interfaces/movimientos-inventario/tipos_movimientos.enum';
import { TransferirProductoDto } from './dto/transferir-producto.dto';

@Injectable()
export class LotesService {
  constructor(
     private readonly dataSource: DataSource,

    @InjectRepository(Lote)
    private readonly loteRepo: Repository<Lote>,
    @InjectRepository(MovimientosInventario)
    private readonly movimientoInvRepository:Repository<MovimientosInventario>
  ) {}

  async create(createLoteDto: CreateLoteDto) {
    const lote = this.loteRepo.create(createLoteDto);
    return await this.loteRepo.save(lote);
  }

  async transferirProducto(
  transferirProductoDto: TransferirProductoDto
) {
  const { sucursalOrigenId, sucursalDestinoId, productoId, cantidad } = transferirProductoDto;
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const lotesOrigen = await queryRunner.manager.find(Lote, {
      where: {
        id_producto: productoId,
        id_sucursal: sucursalOrigenId,
      },
      relations: ['compra'],
      order: {
        created_at: 'ASC',
      },
    });

    if (!lotesOrigen.length) {
      throw new NotFoundException('No existe stock en la sucursal origen');
    }

    const stockDisponible = lotesOrigen.reduce(
      (acc, lote) => acc + Number(lote.cantidad),
      0,
    );

    if (stockDisponible < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${stockDisponible}`,
      );
    }

    let cantidadPendiente = cantidad;

    for (const loteOrigen of lotesOrigen) {
      if (cantidadPendiente <= 0) break;

      const disponible = Number(loteOrigen.cantidad);
      const cantidadARestar = Math.min(disponible, cantidadPendiente);

      
      loteOrigen.cantidad = Number(loteOrigen.cantidad) - cantidadARestar;
      await queryRunner.manager.save(loteOrigen);


      let loteDestino = await queryRunner.manager.findOne(Lote, {
        where: {
          id_producto: productoId,
          id_sucursal: sucursalDestinoId,
          id_compra: loteOrigen.id_compra, 
        },
      });

      if (!loteDestino) {
   
        loteDestino = queryRunner.manager.create(Lote, {
          id_producto: productoId,
          id_sucursal: sucursalDestinoId,
          id_compra: loteOrigen.id_compra, 
          cantidad: cantidadARestar,
          costo: Number(loteOrigen.costo) * cantidadARestar / Number(loteOrigen.cantidad + cantidadARestar),
          costo_por_unidad: loteOrigen.costo_por_unidad,
        });
      } else {
   
        const costoTotalActual = Number(loteDestino.costo);
        const cantidadActual = Number(loteDestino.cantidad);
        const costoTotalNuevo = cantidadARestar * (loteOrigen.costo_por_unidad || (Number(loteOrigen.costo) / Number(loteOrigen.cantidad + cantidadARestar)));
        
        loteDestino.cantidad = cantidadActual + cantidadARestar;
        loteDestino.costo = costoTotalActual + costoTotalNuevo;
        loteDestino.costo_por_unidad = loteDestino.costo / loteDestino.cantidad;
      }

      await queryRunner.manager.save(loteDestino);


      const movimiento = queryRunner.manager.create(MovimientosInventario, {
        lote: loteOrigen,
        tipo: TipoMovimientoInventario.TRANSFERENCIA,
        cantidad: cantidadARestar,
        sucursal_origen_id: sucursalOrigenId,
        sucursal_destino_id: sucursalDestinoId,
      });

      await queryRunner.manager.save(movimiento);

      cantidadPendiente -= cantidadARestar;
    }

    await queryRunner.commitTransaction();

    return {
      message: 'Transferencia realizada correctamente',
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
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

   async findBySucursal(id_sucursal: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      
      const queryBuilder = this.loteRepo
        .createQueryBuilder('lote')
        .leftJoinAndSelect('lote.producto', 'producto')
        .leftJoinAndSelect('lote.sucursal', 'sucursal')
        .leftJoinAndSelect('lote.compra', 'compra')
        .where('lote.id_sucursal = :id_sucursal', { id_sucursal })
        .andWhere('lote.cantidad > 0')
  
      queryBuilder.orderBy('lote.created_at',  'DESC');
      queryBuilder.skip(offset).take(limit)

      const [lotes, total] = await queryBuilder.getManyAndCount();

      return {
        total,
        limit,
        offset,
        lotes: lotes.map(lote => ({
          id: lote.id,
          id_compra: lote.id_compra,
          id_sucursal: lote.id_sucursal,
          nombre_sucursal: lote.sucursal?.nombre,
          id_producto: lote.id_producto,
          nombre_producto: lote.producto?.nombre,
          codigo_producto: lote.producto?.codigo,
          cantidad: Number(lote.cantidad),
          costo: Number(lote.costo),
          costo_por_unidad: lote.costo_por_unidad ? Number(lote.costo_por_unidad) : null,
          created_at: lote.created_at,
          updated_at: lote.updated_at,
        })),
      };
    } catch (error) {
      throw error
    }
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
  ) {
    const resultado = await this.loteRepo
      .createQueryBuilder('lote')
      .select('SUM(lote.cantidad)', 'total')
      .where('lote.id_producto = :id_producto', { id_producto })
      .andWhere('lote.id_sucursal = :id_sucursal', { id_sucursal })
      .andWhere('lote.cantidad > 0')
      .getRawOne();

    const existencia = parseFloat(resultado?.total) || 0;

    let sucursalesConExistencia = [];

    if (existencia === 0) {
      sucursalesConExistencia = await this.loteRepo
        .createQueryBuilder('lote')
        .leftJoin('lote.sucursal', 'sucursal')
        .select('sucursal.id', 'id')
        .addSelect('sucursal.nombre', 'nombre')
        .addSelect('SUM(lote.cantidad)', 'existencia')
        .where('lote.id_producto = :id_producto', { id_producto })
        .andWhere('lote.cantidad > 0')
        .groupBy('sucursal.id')
        .addGroupBy('sucursal.nombre')
        .getRawMany();
    }

    return {
      existencia,
      sucursalesConExistencia,
    };
  }

  async reducirInventario(
    id_producto: string,
    id_sucursal: string,
    cantidadSolicitada: number,
  ) {
    const lotes = await this.loteRepo.find({
      where: { id_producto, id_sucursal },
      order: { id: 'ASC' },
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
