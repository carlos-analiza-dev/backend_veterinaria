import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoteAgroProducto } from './entities/lote-agro-compra.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { TipoMovimientoInventario } from 'src/interfaces/movimientos-inventario/tipos_movimientos.enum';
import { AgroMovimientosInventario } from 'src/movimientos_inventario/entities/agro-movimientos-inventario.entity';
import { TransferirProductoDto } from 'src/lotes/dto/transferir-producto.dto';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  AccionMovimiento,
  AuditoriaMovimientosAgro,
} from 'src/movimientos_inventario/entities/audit-movimientos-agro.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class LotesAgroProductosService {
  constructor(
    @InjectRepository(LoteAgroProducto)
    private readonly loteRepo: Repository<LoteAgroProducto>,
    @InjectRepository(AuditoriaMovimientosAgro)
    private readonly auditMovimientosLote: Repository<AuditoriaMovimientosAgro>,
    private readonly dataSource: DataSource,
    private readonly validationAgroService: AgroservicioValidationService,
  ) {}

  async transferirProducto(transferirProductoDto: TransferirProductoDto) {
    const { sucursalOrigenId, sucursalDestinoId, productoId, cantidad } =
      transferirProductoDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lotesOrigen = await queryRunner.manager.find(LoteAgroProducto, {
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

        let loteDestino = await queryRunner.manager.findOne(LoteAgroProducto, {
          where: {
            id_producto: productoId,
            id_sucursal: sucursalDestinoId,
            id_compra: loteOrigen.id_compra,
          },
        });

        if (!loteDestino) {
          loteDestino = queryRunner.manager.create(LoteAgroProducto, {
            id_producto: productoId,
            id_sucursal: sucursalDestinoId,
            id_compra: loteOrigen.id_compra,
            cantidad: cantidadARestar,
            costo:
              (Number(loteOrigen.costo) * cantidadARestar) /
              Number(loteOrigen.cantidad + cantidadARestar),
            costo_por_unidad: loteOrigen.costo_por_unidad,
          });
        } else {
          const costoTotalActual = Number(loteDestino.costo);
          const cantidadActual = Number(loteDestino.cantidad);
          const costoTotalNuevo =
            cantidadARestar *
            (loteOrigen.costo_por_unidad ||
              Number(loteOrigen.costo) /
                Number(loteOrigen.cantidad + cantidadARestar));

          loteDestino.cantidad = cantidadActual + cantidadARestar;
          loteDestino.costo = costoTotalActual + costoTotalNuevo;
          loteDestino.costo_por_unidad =
            loteDestino.costo / loteDestino.cantidad;
        }

        await queryRunner.manager.save(loteDestino);

        const movimiento = queryRunner.manager.create(
          AgroMovimientosInventario,
          {
            lote: loteOrigen,
            tipo: TipoMovimientoInventario.TRANSFERENCIA,
            cantidad: cantidadARestar,
            sucursal_origen_id: sucursalOrigenId,
            sucursal_destino_id: sucursalDestinoId,
          },
        );

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

  async transferirProductoEmpleado(
    empleado: EmpleadosAgro,
    transferirProductoDto: TransferirProductoDto,
  ) {
    const { sucursalOrigenId, sucursalDestinoId, productoId, cantidad } =
      transferirProductoDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lotesOrigen = await queryRunner.manager.find(LoteAgroProducto, {
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

        let loteDestino = await queryRunner.manager.findOne(LoteAgroProducto, {
          where: {
            id_producto: productoId,
            id_sucursal: sucursalDestinoId,
            id_compra: loteOrigen.id_compra,
          },
        });

        if (!loteDestino) {
          loteDestino = queryRunner.manager.create(LoteAgroProducto, {
            id_producto: productoId,
            id_sucursal: sucursalDestinoId,
            id_compra: loteOrigen.id_compra,
            cantidad: cantidadARestar,
            costo:
              (Number(loteOrigen.costo) * cantidadARestar) /
              Number(loteOrigen.cantidad + cantidadARestar),
            costo_por_unidad: loteOrigen.costo_por_unidad,
          });
        } else {
          const costoTotalActual = Number(loteDestino.costo);
          const cantidadActual = Number(loteDestino.cantidad);
          const costoTotalNuevo =
            cantidadARestar *
            (loteOrigen.costo_por_unidad ||
              Number(loteOrigen.costo) /
                Number(loteOrigen.cantidad + cantidadARestar));

          loteDestino.cantidad = cantidadActual + cantidadARestar;
          loteDestino.costo = costoTotalActual + costoTotalNuevo;
          loteDestino.costo_por_unidad =
            loteDestino.costo / loteDestino.cantidad;
        }

        await queryRunner.manager.save(loteDestino);

        const movimiento = queryRunner.manager.create(
          AgroMovimientosInventario,
          {
            lote: loteOrigen,
            tipo: TipoMovimientoInventario.TRANSFERENCIA,
            cantidad: cantidadARestar,
            sucursal_origen_id: sucursalOrigenId,
            sucursal_destino_id: sucursalDestinoId,
          },
        );

        await queryRunner.manager.save(movimiento);

        await queryRunner.manager.save(AuditoriaMovimientosAgro, {
          movimientoId: movimiento.id,
          empleadoId: empleado.id,
          accion: AccionMovimiento.CREAR,
        });

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

  async findAuditoria(cliente: Cliente, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const query = this.auditMovimientosLote
      .createQueryBuilder('auditoria')
      .leftJoin('auditoria.movimiento', 'movimiento')
      .leftJoin('movimiento.lote', 'lote')
      .leftJoin('lote.sucursal', 'sucursal')
      .leftJoin('sucursal.agroservicio', 'agroservicio')
      .leftJoin('auditoria.empleado', 'empleado')
      .leftJoin('empleado.role', 'rol')
      .where('agroservicio.propietarioId = :propietarioId', {
        propietarioId: cliente.id,
      })
      .select([
        'auditoria.id',
        'auditoria.accion',
        'auditoria.fecha',

        'movimiento.id',
        'movimiento.tipo',
        'movimiento.cantidad',

        'lote.id',

        'empleado.id',
        'empleado.nombre',

        'rol.id',
        'rol.name',
      ])
      .orderBy('auditoria.fecha', 'DESC')
      .take(limit)
      .skip(offset);

    const [data, total] = await query.getManyAndCount();

    return {
      total,
      limit,
      offset,
      data,
    };
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

  async findBySucursal(
    id_sucursal: string,
    propietarioId: string,
    paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;

    const agroservicio =
      await this.validationAgroService.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    try {
      const queryBuilder = this.loteRepo
        .createQueryBuilder('lote')
        .leftJoinAndSelect('lote.producto', 'producto')
        .leftJoinAndSelect('lote.sucursal', 'sucursal')
        .leftJoinAndSelect('sucursal.agroservicio', 'agroservicio')
        .leftJoinAndSelect('lote.compra', 'compra')
        .where('lote.id_sucursal = :id_sucursal', { id_sucursal })
        .andWhere('agroservicio.id = :agroservicioId', {
          agroservicioId,
        })
        .andWhere('lote.cantidad > 0');

      queryBuilder.orderBy('lote.created_at', 'DESC');
      queryBuilder.skip(offset).take(limit);

      const [lotes, total] = await queryBuilder.getManyAndCount();

      return {
        total,
        limit,
        offset,
        lotes: lotes.map((lote) => ({
          id: lote.id,
          id_compra: lote.id_compra,
          id_sucursal: lote.id_sucursal,
          nombre_sucursal: lote.sucursal?.nombre,
          id_producto: lote.id_producto,
          nombre_producto: lote.producto?.nombre,
          codigo_producto: lote.producto?.codigo,
          cantidad: Number(lote.cantidad),
          costo: Number(lote.costo),
          costo_por_unidad: lote.costo_por_unidad
            ? Number(lote.costo_por_unidad)
            : null,
          created_at: lote.created_at,
          updated_at: lote.updated_at,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  async getExistenciasByProducto(
    propietarioId: string,
    paginationDto: PaginationDto,
  ) {
    const { sucursal, producto, limit = 10, offset = 0 } = paginationDto;

    const agroservicio =
      await this.validationAgroService.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    const query = this.loteRepo
      .createQueryBuilder('lote')
      .leftJoin('lote.producto', 'producto')
      .leftJoin('lote.sucursal', 'sucursal')
      .select('producto.id', 'productoId')
      .addSelect('producto.nombre', 'productoNombre')
      .addSelect('producto.codigo', 'codigo')
      .addSelect('producto.codigo_barra', 'codigo_barra')
      .addSelect('sucursal.id', 'sucursalId')
      .addSelect('sucursal.nombre', 'sucursalNombre')
      .addSelect('SUM(lote.cantidad)', 'existenciaTotal')
      .where('sucursal.agroservicioId = :agroservicioId', { agroservicioId })
      .groupBy('producto.id')
      .addGroupBy('producto.nombre')
      .addGroupBy('producto.codigo')
      .addGroupBy('producto.codigo_barra')
      .addGroupBy('sucursal.id')
      .addGroupBy('sucursal.nombre')
      .limit(limit)
      .offset(offset);

    if (sucursal) {
      query.andWhere('sucursal.id = :sucursal', { sucursal });
    }

    if (producto) {
      query.andWhere('producto.id = :producto', { producto });
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
}
