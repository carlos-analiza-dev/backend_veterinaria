import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { User } from '../auth/entities/auth.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(CompraDetalle)
    private readonly compraDetalleRepository: Repository<CompraDetalle>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(SubServicio)
    private readonly servicioRepository: Repository<SubServicio>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompraDto: CreateCompraDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar duplicados de productos
      const productosIds = createCompraDto.detalles.map((d) => d.productoId);
      const productosUnicos = new Set(productosIds);
      if (productosIds.length !== productosUnicos.size) {
        throw new BadRequestException('Productos duplicados en los detalles');
      }

      // Calcular totales y procesar detalles
      let subtotalCompra = 0;
      let impuestosCompra = 0;
      let descuentosCompra = 0;

      const detallesCalculados = createCompraDto.detalles.map((detalle) => {
        const cantidad_total =
          Number(detalle.cantidad) + (Number(detalle.bonificacion) || 0);
        const subtotalDetalle =
          cantidad_total * Number(detalle.costo_por_unidad);
        const monto_total =
          subtotalDetalle -
          (Number(detalle.descuentos) || 0) +
          (Number(detalle.impuestos) || 0);

        // Acumular totales de compra
        subtotalCompra += subtotalDetalle;
        impuestosCompra += Number(detalle.impuestos) || 0;
        descuentosCompra += Number(detalle.descuentos) || 0;

        return {
          ...detalle,
          cantidad_total,
          monto_total,
        };
      });

      // Crear la compra
      const compra = this.compraRepository.create({
        ...createCompraDto,
        subtotal: subtotalCompra,
        impuestos: impuestosCompra,
        descuentos: descuentosCompra,
        total: subtotalCompra - descuentosCompra + impuestosCompra,
        createdById: user.id,
        updatedById: user.id,
      });

      const compraGuardada = await queryRunner.manager.save(compra);

      // Crear los detalles y lotes (un lote por cada línea de compra)
      for (const detalleCalculado of detallesCalculados) {
        const detalle = this.compraDetalleRepository.create({
          ...detalleCalculado,
          compraId: compraGuardada.id,
        });
        await queryRunner.manager.save(detalle);

        // Costo por unidad = (subtotal + impuestos - descuentos) / cantidad_total
        const costoRealPorUnidad =
          (subtotalCompra + impuestosCompra - descuentosCompra) /
          detalleCalculado.cantidad_total;

        // Crear lote por cada línea de compra con el costo prorrateado correcto
        const lote = this.loteRepository.create({
          id_producto: detalleCalculado.productoId,
          cantidad: detalleCalculado.cantidad_total,
          costo: costoRealPorUnidad, // Este es el costo real que incluye impuestos
          id_compra: compraGuardada.id,
          id_sucursal: createCompraDto.sucursalId,
        });
        await queryRunner.manager.save(lote);
      }

      await queryRunner.commitTransaction();
      return await this.findOne(compraGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, proveedor = '' } = paginationDto;

    try {
      const queryBuilder = this.compraRepository
        .createQueryBuilder('compra')
        .leftJoinAndSelect('compra.proveedor', 'proveedor')
        .leftJoinAndSelect('compra.sucursal', 'sucursal')
        .orderBy('compra.created_at', 'DESC');

      if (proveedor && proveedor.trim() !== '') {
        queryBuilder.andWhere(
          '(proveedor.id = :proveedorId OR proveedor.nombre_legal ILIKE :proveedorNombre)',
          {
            proveedorId: proveedor,
            proveedorNombre: `%${proveedor}%`,
          },
        );
      }

      if (limit !== undefined) queryBuilder.take(limit);
      if (offset !== undefined) queryBuilder.skip(offset);

      const [compras, total] = await queryBuilder.getManyAndCount();

      return {
        compras: instanceToPlain(compras),
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: ['detalles', 'lotes', 'proveedor', 'sucursal'],
    });

    if (!compra) {
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    }

    return compra;
  }

  async update(id: string, updateCompraDto: UpdateCompraDto, user: User) {
    const compra = await this.findOne(id);

    Object.assign(compra, {
      ...updateCompraDto,
      updatedById: user.id,
    });

    return await this.compraRepository.save(compra);
  }

  async remove(id: string): Promise<void> {
    const compra = await this.findOne(id);
    await this.compraRepository.remove(compra);
  }

  // Consultar existencias totales de un producto (lo que mencionó tu jefe)
  async getExistenciasProducto(productoId: string, sucursalId?: string) {
    const whereCondition: any = { id_producto: productoId };
    if (sucursalId) {
      whereCondition.id_sucursal = sucursalId;
    }

    const lotes = await this.loteRepository
      .createQueryBuilder('lote')
      .where('lote.id_producto = :productoId', { productoId })
      .andWhere('lote.cantidad > 0')
      .andWhere('lote.id_producto IS NOT NULL')
      .andWhere('lote.id_sucursal IS NOT NULL')
      .andWhere('lote.id_compra IS NOT NULL')
      .andWhere(
        sucursalId ? 'lote.id_sucursal = :sucursalId' : '1=1',
        sucursalId ? { sucursalId } : {},
      )
      .select([
        'lote.id',
        'lote.id_compra',
        'lote.id_sucursal',
        'lote.id_producto',
        'lote.cantidad',
        'lote.costo',
      ])
      .orderBy('lote.id', 'ASC')
      .getMany();

    const totalExistencia = lotes.reduce((total, lote) => {
      return total + Number(lote.cantidad);
    }, 0);

    return {
      id_producto: productoId,
      id_sucursal: sucursalId || null,
      totalExistencia,
      lotes: lotes.map((lote) => ({
        id: lote.id,
        id_compra: lote.id_compra,
        cantidad: lote.cantidad,
        costo: lote.costo,
      })),
    };
  }

  // Método para usar/vender productos (FIFO - lote más antiguo primero)
  async reducirInventario(
    productoId: string,
    sucursalId: string,
    cantidadSolicitada: number,
  ) {
    const lotes = await this.loteRepository.find({
      where: {
        id_producto: productoId,
        id_sucursal: sucursalId,
      },
      order: { id: 'ASC' }, // FIFO - primero el más antiguo
    });

    let cantidadPendiente = cantidadSolicitada;
    const lotesAfectados = [];

    for (const lote of lotes) {
      if (cantidadPendiente <= 0) break;
      if (lote.cantidad <= 0) continue;

      const cantidadARebajar = Math.min(cantidadPendiente, lote.cantidad);

      lote.cantidad -= cantidadARebajar;
      cantidadPendiente -= cantidadARebajar;

      await this.loteRepository.save(lote);
      lotesAfectados.push({
        loteId: lote.id,
        cantidadRebajada: cantidadARebajar,
        cantidadRestante: lote.cantidad,
      });
    }

    if (cantidadPendiente > 0) {
      throw new BadRequestException(
        `No hay suficiente inventario. Faltaron ${cantidadPendiente} unidades.`,
      );
    }

    return {
      message: `Se redujeron ${cantidadSolicitada} unidades del inventario`,
      lotesAfectados,
    };
  }
}
