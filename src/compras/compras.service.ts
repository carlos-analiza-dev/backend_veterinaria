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
import { LoteInsumo } from '../lotes/entities/lote-insumo.entity';
import { User } from '../auth/entities/auth.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';
import { Pai } from 'src/pais/entities/pai.entity';
import { InventarioQueryDto, TipoInventario } from './dto/inventario-query.dto';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(CompraDetalle)
    private readonly compraDetalleRepository: Repository<CompraDetalle>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(LoteInsumo)
    private readonly loteInsumoRepository: Repository<LoteInsumo>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(SubServicio)
    private readonly servicioRepository: Repository<SubServicio>,
    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompraDto: CreateCompraDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proveedor_exist = await this.proveedorRepository.findOne({
        where: { id: createCompraDto.proveedorId },
      });
      if (!proveedor_exist)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const sucursal_exist = await this.sucursalRepository.findOne({
        where: { id: createCompraDto.sucursalId },
      });
      if (!sucursal_exist)
        throw new NotFoundException('No se encontro la sucursal seleccionado');

      const pais_exist = await this.paisRepository.findOne({
        where: { id: createCompraDto.paisId },
      });
      if (!pais_exist)
        throw new NotFoundException('El pais seleccionado no existe');

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
          Number(detalle.cantidad) * Number(detalle.costo_por_unidad);
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
        numero_factura: createCompraDto.numero_factura,
        subtotal: subtotalCompra,
        impuestos: impuestosCompra,
        descuentos: descuentosCompra,
        total: subtotalCompra - descuentosCompra + impuestosCompra,
        createdById: user.id,
        updatedById: user.id,
        pais: pais_exist,
      });

      const compraGuardada = await queryRunner.manager.save(compra);

      // Crear los detalles y lotes (un lote por cada línea de compra)
      for (const detalleCalculado of detallesCalculados) {
        const detalle = this.compraDetalleRepository.create({
          ...detalleCalculado,
          compraId: compraGuardada.id,
        });
        await queryRunner.manager.save(detalle);

        // Costo por unidad = monto_total_del_detalle / cantidad_total
        const costoRealPorUnidad =
          detalleCalculado.monto_total / detalleCalculado.cantidad_total;

        // Crear lote por cada línea de compra con el costo prorrateado correcto
        const lote = this.loteRepository.create({
          id_producto: detalleCalculado.productoId,
          cantidad: detalleCalculado.cantidad_total,
          costo: Number(detalleCalculado.costo_por_unidad),
          costo_por_unidad: costoRealPorUnidad,
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
      const queryBuilder = this.compraRepository
        .createQueryBuilder('compra')
        .leftJoinAndSelect('compra.detalles', 'detalles')
        .leftJoinAndSelect('compra.lotes', 'lotes')
        .leftJoinAndSelect('compra.proveedor', 'proveedor')
        .leftJoinAndSelect('compra.sucursal', 'sucursal')
        .leftJoinAndSelect('compra.pais', 'pais')
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

  async getInventario(inventarioQuery: InventarioQueryDto) {
    const {
      limit = 10,
      offset = 0,
      tipo = TipoInventario.AMBOS,
      sucursalId,
      sucursal,
      marcaId,
      marca,
      categoriaId,
      categoria,
      nombre,
      codigo,
    } = inventarioQuery;

    try {
      const inventario = [];

      // ✅ PRODUCTOS - USANDO GROUP BY SQL NATIVO
      if (tipo === TipoInventario.PRODUCTOS || tipo === TipoInventario.AMBOS) {
        const productosQuery = this.loteRepository
          .createQueryBuilder('lote')
          .select([
            'producto.id as id',
            'producto.nombre as nombre',
            'producto.codigo as codigo',
            'marca.nombre as marca_nombre',
            'categoria.nombre as categoria_nombre',
            'sucursal.id as sucursal_id',
            'sucursal.nombre as sucursal_nombre',
            'SUM(lote.cantidad) as total_existencia',
          ])
          .leftJoin('lote.producto', 'producto')
          .leftJoin('lote.sucursal', 'sucursal')
          .leftJoin('producto.marca', 'marca')
          .leftJoin('producto.categoria', 'categoria')
          .where('lote.cantidad > 0')
          .andWhere('lote.id_producto IS NOT NULL')
          .groupBy('producto.id')
          .addGroupBy('producto.nombre')
          .addGroupBy('producto.codigo')
          .addGroupBy('marca.nombre')
          .addGroupBy('categoria.nombre')
          .addGroupBy('sucursal.id')
          .addGroupBy('sucursal.nombre');

        // Aplicar filtros
        if (sucursalId) {
          productosQuery.andWhere('sucursal.id = :sucursalId', { sucursalId });
        }
        if (sucursal) {
          productosQuery.andWhere('sucursal.nombre ILIKE :sucursal', {
            sucursal: `%${sucursal}%`,
          });
        }
        if (marcaId) {
          productosQuery.andWhere('marca.id = :marcaId', { marcaId });
        }
        if (marca) {
          productosQuery.andWhere('marca.nombre ILIKE :marca', {
            marca: `%${marca}%`,
          });
        }
        if (categoriaId) {
          productosQuery.andWhere('categoria.id = :categoriaId', {
            categoriaId,
          });
        }
        if (categoria) {
          productosQuery.andWhere('categoria.nombre ILIKE :categoria', {
            categoria: `%${categoria}%`,
          });
        }
        if (nombre) {
          productosQuery.andWhere('producto.nombre ILIKE :nombre', {
            nombre: `%${nombre}%`,
          });
        }
        if (codigo) {
          productosQuery.andWhere('producto.codigo ILIKE :codigo', {
            codigo: `%${codigo}%`,
          });
        }

        const productosRaw = await productosQuery.getRawMany();

        // Formatear resultados
        const productosFormateados = productosRaw.map((row) => ({
          id: row.id,
          nombre: row.nombre,
          codigo: row.codigo,
          precio: null,
          foto: null,
          marca_nombre: row.marca_nombre || 'Sin marca',
          categoria_nombre: row.categoria_nombre || 'Sin categoría',
          sucursal_id: row.sucursal_id,
          sucursal_nombre: row.sucursal_nombre,
          total_existencia: Number(row.total_existencia),
          tipo: 'PRODUCTO',
        }));

        inventario.push(...productosFormateados);
      }

      // ✅ INSUMOS - USANDO GROUP BY SQL NATIVO
      if (tipo === TipoInventario.INSUMOS || tipo === TipoInventario.AMBOS) {
        const insumosQuery = this.loteInsumoRepository
          .createQueryBuilder('lote_insumo')
          .select([
            'insumo.id as id',
            'insumo.nombre as nombre',
            'insumo.codigo as codigo',
            'insumo.costo as precio',
            'marca.nombre as marca_nombre',
            'sucursal.id as sucursal_id',
            'sucursal.nombre as sucursal_nombre',
            'SUM(lote_insumo.cantidad) as total_existencia',
          ])
          .leftJoin('lote_insumo.insumo', 'insumo')
          .leftJoin('lote_insumo.sucursal', 'sucursal')
          .leftJoin('insumo.marca', 'marca')
          .where('lote_insumo.cantidad > 0')
          .andWhere('lote_insumo.id_insumo IS NOT NULL')
          .groupBy('insumo.id')
          .addGroupBy('insumo.nombre')
          .addGroupBy('insumo.codigo')
          .addGroupBy('insumo.costo')
          .addGroupBy('marca.nombre')
          .addGroupBy('sucursal.id')
          .addGroupBy('sucursal.nombre');

        // Aplicar filtros
        if (sucursalId) {
          insumosQuery.andWhere('sucursal.id = :sucursalId', { sucursalId });
        }
        if (sucursal) {
          insumosQuery.andWhere('sucursal.nombre ILIKE :sucursal', {
            sucursal: `%${sucursal}%`,
          });
        }
        if (marcaId) {
          insumosQuery.andWhere('marca.id = :marcaId', { marcaId });
        }
        if (marca) {
          insumosQuery.andWhere('marca.nombre ILIKE :marca', {
            marca: `%${marca}%`,
          });
        }
        if (nombre) {
          insumosQuery.andWhere('insumo.nombre ILIKE :nombre', {
            nombre: `%${nombre}%`,
          });
        }
        if (codigo) {
          insumosQuery.andWhere('insumo.codigo ILIKE :codigo', {
            codigo: `%${codigo}%`,
          });
        }

        const insumosRaw = await insumosQuery.getRawMany();

        // Formatear resultados
        const insumosFormateados = insumosRaw.map((row) => ({
          id: row.id,
          nombre: row.nombre,
          codigo: row.codigo,
          precio: Number(row.precio),
          foto: null,
          marca_nombre: row.marca_nombre || 'Sin marca',
          categoria_nombre: null,
          sucursal_id: row.sucursal_id,
          sucursal_nombre: row.sucursal_nombre,
          total_existencia: Number(row.total_existencia),
          tipo: 'INSUMO',
        }));

        inventario.push(...insumosFormateados);
      }

      // ✅ ORDENAR Y PAGINAR
      inventario.sort((a, b) => a.nombre.localeCompare(b.nombre));
      const total = inventario.length;
      const paginatedInventario = inventario.slice(offset, offset + limit);

      return {
        inventario: instanceToPlain(paginatedInventario),
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener el inventario: ${error.message}`,
      );
    }
  }

  // Método existente getExistenciasProducto
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
        'lote.costo_por_unidad',
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
        costo_por_unidad: lote.costo_por_unidad,
      })),
    };
  }

  // Método para reducir inventario (FIFO)
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
      order: { id: 'ASC' }, // FIFO
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
