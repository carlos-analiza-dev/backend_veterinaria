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
import { Pai } from 'src/pais/entities/pai.entity';

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
    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompraInsumoDto: CreateCompraInsumoDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proveedor_exist = await this.proveedorRepository.findOne({
        where: { id: createCompraInsumoDto.proveedorId },
      });
      if (!proveedor_exist)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const sucursal_exist = await this.sucursalRepository.findOne({
        where: { id: createCompraInsumoDto.sucursalId },
      });
      if (!sucursal_exist)
        throw new NotFoundException('No se encontro la sucursal seleccionado');

      const pais_exist = await this.paisRepository.findOne({
        where: { id: createCompraInsumoDto.paisId },
      });
      if (!pais_exist)
        throw new NotFoundException('El pais seleccionado no existe');

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

      // Crear la compra
      const compra = this.compraInsumoRepository.create({
        ...createCompraInsumoDto,
        createdById: user.id,
        updatedById: user.id,
        numero_factura: createCompraInsumoDto.numero_factura,
      });

      const compraGuardada = await queryRunner.manager.save(
        CompraInsumo,
        compra,
      );

      // Crear los detalles y lotes (un lote por cada línea de compra)
      for (const detalle of createCompraInsumoDto.detalles) {
        const detalleEntity = this.detalleCompraInsumoRepository.create({
          ...detalle,
          compraId: compraGuardada.id,
        });
        await queryRunner.manager.save(detalleEntity);

        const cantidadTotal = detalle.cantidad + (detalle.bonificacion || 0);

        const costoRealPorUnidad = detalle.monto_total / cantidadTotal;

        const lote = this.invLoteInsumoRepository.create({
          insumo: { id: detalle.insumoId },
          cantidad: cantidadTotal,
          costo: detalle.monto_total,
          costo_por_unidad: costoRealPorUnidad,
          compra: { id: compraGuardada.id },
          sucursal: { id: createCompraInsumoDto.sucursalId },
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

  async findAll(user: User, paginationDto: PaginationDto) {
    const paisId = user.pais.id;
    const {
      limit = 10,
      offset = 0,
      proveedor = '',
      sucursal = '',
      tipoPago = '',
    } = paginationDto;

    try {
      const queryBuilder = this.compraInsumoRepository
        .createQueryBuilder('compra')
        .leftJoinAndSelect('compra.detalles', 'detalles')
        .leftJoinAndSelect('compra.lotes', 'lotes')
        .leftJoinAndSelect('compra.proveedor', 'proveedor')
        .leftJoinAndSelect('compra.sucursal', 'sucursal')
        .leftJoinAndSelect('compra.pais', 'pais')
        .leftJoinAndSelect('compra.created_by', 'created_by')
        .leftJoinAndSelect('compra.updated_by', 'updated_by')
        .orderBy('compra.created_at', 'DESC');

      queryBuilder.andWhere('compra.paisId = :paisId', { paisId });

      if (proveedor && proveedor.trim() !== '') {
        queryBuilder.andWhere(
          '(proveedor.id = :proveedorId OR proveedor.nombre_legal ILIKE :proveedorNombre)',
          {
            proveedorId: proveedor,
            proveedorNombre: `%${proveedor}%`,
          },
        );
      }

      if (sucursal && sucursal.trim() !== '') {
        queryBuilder.andWhere(
          '(sucursal.id = :sucursalId OR sucursal.nombre ILIKE :sucursalNombre)',
          {
            sucursalId: sucursal,
            sucursalNombre: `%${sucursal}%`,
          },
        );
      }

      if (tipoPago && tipoPago.trim() !== '') {
        queryBuilder.andWhere('compra.tipo_pago = :tipoPago', {
          tipoPago: tipoPago.toUpperCase(),
        });
      }

      if (limit !== undefined) queryBuilder.take(limit);
      if (offset !== undefined) queryBuilder.skip(offset);

      const [compras, total] = await queryBuilder.getManyAndCount();

      if (!compras || compras.length === 0) {
        let errorMessage = 'No se encontraron compras';
        const filters = [];

        if (proveedor) filters.push(`proveedor: ${proveedor}`);
        if (sucursal) filters.push(`sucursal: ${sucursal}`);
        if (tipoPago) filters.push(`tipo de pago: ${tipoPago}`);

        if (filters.length > 0) {
          errorMessage += ` con los filtros: ${filters.join(', ')}`;
        }

        throw new BadRequestException(errorMessage);
      }

      return {
        compras: instanceToPlain(compras),
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async findByInsumo(id_insumo: string) {
    const lotes = await this.invLoteInsumoRepository.find({
      where: { insumo: { id: id_insumo } },
      relations: ['compra', 'sucursal', 'insumo'],
      order: { id: 'ASC' },
    });

    if (!lotes || lotes.length === 0) {
      throw new NotFoundException(
        `No se encontraron lotes para el insumo con ID: ${id_insumo}`,
      );
    }
    return lotes;
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

  async getExistenciasInsumos(user: User, paginationDto: PaginationDto) {
    const paisId = user.pais.id;
    const { sucursal, insumo, limit = 10, offset = 0 } = paginationDto;

    const query = this.invLoteInsumoRepository
      .createQueryBuilder('lote')
      .leftJoin('lote.insumo', 'insumo')
      .leftJoin('lote.sucursal', 'sucursal')
      .leftJoin('lote.compra', 'compra')
      .leftJoin('compra.pais', 'pais')
      .select('insumo.id', 'insumoId')
      .addSelect('insumo.nombre', 'insumoNombre')
      .addSelect('insumo.codigo', 'codigo')
      .addSelect('sucursal.id', 'sucursalId')
      .addSelect('sucursal.nombre', 'sucursalNombre')
      .addSelect('pais.id', 'paisId')
      .addSelect('pais.nombre', 'paisNombre')
      .addSelect('SUM(lote.cantidad)', 'existenciaTotal')
      .where('pais.id = :paisId', { paisId })
      .andWhere('lote.compraId IS NOT NULL')
      .groupBy('insumo.id')
      .addGroupBy('insumo.nombre')
      .addGroupBy('sucursal.id')
      .addGroupBy('sucursal.nombre')
      .addGroupBy('pais.id')
      .addGroupBy('pais.nombre')
      .limit(limit)
      .offset(offset);

    if (sucursal) {
      query.andWhere('sucursal.id = :sucursalId', { sucursalId: sucursal });
    }

    if (insumo) {
      query.andWhere('insumo.id = :insumoId', { insumoId: insumo });
    }

    return await query.getRawMany();
  }
}
