import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateCompraInsumoDto } from './dto/create-compra-insumo.dto';
import { UpdateCompraInsumoDto } from './dto/update-compra-insumo.dto';
import { CompraInsumo } from './entities/compra-insumo.entity';
import { DetalleCompraInsumo } from './entities/detalle-compra-insumo.entity';
import { InvLoteInsumo } from './entities/inv-lote-insumo.entity';
import { User } from '../auth/entities/auth.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CompraInsumosService {
  constructor(
    @InjectRepository(CompraInsumo)
    private readonly compraInsumoRepository: Repository<CompraInsumo>,
    @InjectRepository(DetalleCompraInsumo)
    private readonly detalleCompraInsumoRepository: Repository<DetalleCompraInsumo>,
    @InjectRepository(InvLoteInsumo)
    private readonly invLoteInsumoRepository: Repository<InvLoteInsumo>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompraInsumoDto: CreateCompraInsumoDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar duplicados de insumos
      const insumosIds = createCompraInsumoDto.detalles.map((d) => d.insumoId);
      const insumosUnicos = new Set(insumosIds);
      if (insumosIds.length !== insumosUnicos.size) {
        throw new BadRequestException('Insumos duplicados en los detalles');
      }

      // Validar que todos los insumos existen
      for (const insumoId of insumosIds) {
        const insumo = await this.insumoRepository.findOne({
          where: { id: insumoId },
        });
        if (!insumo) {
          throw new BadRequestException(
            `Insumo con ID ${insumoId} no encontrado`,
          );
        }
      }

      // Usar los valores tal como vienen de la factura

      const detallesCalculados = createCompraInsumoDto.detalles.map(
        (detalle) => {
          const cantidadTotal = detalle.cantidad + (detalle.bonificacion || 0);
          const subtotal = detalle.costo_por_unidad * detalle.cantidad;
          const impuestos = subtotal * (detalle.porcentaje_impuesto || 0) / 100;
          const descuentos = detalle.descuentos || 0;
          const montoTotal = subtotal + impuestos - descuentos;
          
          return {
            ...detalle,
            cantidad_total: cantidadTotal,
            impuestos: impuestos,
            monto_total: montoTotal,
          };
        },
      );

      // Crear la compra
      const compra = this.compraInsumoRepository.create({
        ...createCompraInsumoDto,
        createdById: user.id,
        updatedById: user.id,
      });

      const compraGuardada = await queryRunner.manager.save(
        CompraInsumo,
        compra,
      );

      // Crear los detalles y lotes (un lote por cada línea de compra)
      for (const detalleCalculado of detallesCalculados) {
        const detalle = this.detalleCompraInsumoRepository.create({
          ...detalleCalculado,
          compraId: compraGuardada.id,
        });
        await queryRunner.manager.save(detalle);

        // Costo por unidad en lote = monto_total / cantidad_total
        const costoRealPorUnidad =
          detalleCalculado.monto_total / detalleCalculado.cantidad_total;

        // Crear lote por cada línea de compra con el costo prorrateado correcto
        const lote = this.invLoteInsumoRepository.create({
          insumoId: detalleCalculado.insumoId,
          cantidad: detalleCalculado.cantidad_total,
          costo: detalleCalculado.monto_total, // Costo total (subtotal + impuestos - descuentos)
          costo_por_unidad: costoRealPorUnidad, // Este es el costo real que incluye impuestos
          compraId: compraGuardada.id,
          sucursalId: createCompraInsumoDto.sucursalId,
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
      const queryBuilder = this.compraInsumoRepository
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
    const compra = await this.compraInsumoRepository.findOne({
      where: { id },
      relations: ['detalles', 'lotes', 'proveedor', 'sucursal'],
    });

    if (!compra) {
      throw new NotFoundException(
        `Compra de insumos con ID ${id} no encontrada`,
      );
    }

    return compra;
  }

  async update(
    id: string,
    updateCompraInsumoDto: UpdateCompraInsumoDto,
    user: User,
  ) {
    const compra = await this.findOne(id);

    Object.assign(compra, {
      ...updateCompraInsumoDto,
      updatedById: user.id,
    });

    return await this.compraInsumoRepository.save(compra);
  }

  async remove(id: string): Promise<void> {
    const compra = await this.findOne(id);
    await this.compraInsumoRepository.remove(compra);
  }

  // Consultar existencias totales de un insumo
  async getExistenciasInsumo(insumoId: string, sucursalId?: string) {
    const whereCondition: any = { insumoId: insumoId };
    if (sucursalId) {
      whereCondition.sucursalId = sucursalId;
    }

    const lotes = await this.invLoteInsumoRepository
      .createQueryBuilder('lote')
      .where('lote.insumoId = :insumoId', { insumoId })
      .andWhere('lote.cantidad > 0')
      .andWhere(
        sucursalId ? 'lote.sucursalId = :sucursalId' : '1=1',
        sucursalId ? { sucursalId } : {},
      )
      .select([
        'lote.id',
        'lote.compraId',
        'lote.sucursalId',
        'lote.insumoId',
        'lote.cantidad',
        'lote.costo_por_unidad',
      ])
      .orderBy('lote.id', 'ASC')
      .getMany();

    const totalExistencia = lotes.reduce((total, lote) => {
      return total + Number(lote.cantidad);
    }, 0);

    return {
      insumoId: insumoId,
      sucursalId: sucursalId || null,
      totalExistencia,
      lotes: lotes.map((lote) => ({
        id: lote.id,
        compraId: lote.compraId,
        cantidad: lote.cantidad,
        costo_por_unidad: lote.costo_por_unidad,
      })),
    };
  }
}
