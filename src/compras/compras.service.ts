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
      // Validar que la sucursal existe
      const sucursal = await this.sucursalRepository.findOne({
        where: { id: createCompraDto.sucursalId },
      });
      if (!sucursal) {
        throw new NotFoundException(
          `Sucursal con ID ${createCompraDto.sucursalId} no encontrada`,
        );
      }

      // Validar que el proveedor existe
      const proveedor = await this.proveedorRepository.findOne({
        where: { id: createCompraDto.proveedorId },
      });
      if (!proveedor) {
        throw new NotFoundException(
          `Proveedor con ID ${createCompraDto.proveedorId} no encontrado`,
        );
      }

      // Validar que todos los productos existen
      for (const detalle of createCompraDto.detalles) {
        const producto = await this.servicioRepository.findOne({
          where: { id: detalle.productoId },
        });
        if (!producto) {
          throw new NotFoundException(
            `Producto con ID ${detalle.productoId} no encontrado`,
          );
        }
      }

      // Crear la compra
      const compra = this.compraRepository.create({
        ...createCompraDto,
        createdById: user.id,
        updatedById: user.id,
      });

      const compraGuardada = await queryRunner.manager.save(compra);

      // Crear los detalles
      for (const detalle of createCompraDto.detalles) {
        const detalleGuardado = this.compraDetalleRepository.create({
          ...detalle,
          compraId: compraGuardada.id,
        });

        await queryRunner.manager.save(detalleGuardado);

        // Crear lote con costo unitario calculado
        const cantidad_total =
          Number(detalle.cantidad_total) ||
          Number(detalle.cantidad) + (Number(detalle.bonificacion) || 0);
        const monto_total = Number(detalle.monto_total) || 0;
        const costo_unitario =
          cantidad_total > 0 ? monto_total / cantidad_total : 0;

        const lote = this.loteRepository.create({
          id_compra: compraGuardada.id,
          id_sucursal: createCompraDto.sucursalId,
          id_producto: detalle.productoId,
          cantidad: cantidad_total,
          costo: costo_unitario,
        });

        await queryRunner.manager.save(lote);
      }

      await queryRunner.commitTransaction();

      // Retornar la compra completa
      return await this.findOne(compraGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.compraRepository.find({
      relations: ['detalles', 'lotes', 'proveedor', 'sucursal'],
      order: { created_at: 'DESC' },
    });
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
