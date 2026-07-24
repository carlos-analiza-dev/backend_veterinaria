import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgroComprasProductoDto } from './dto/create-agro-compras-producto.dto';
import { UpdateAgroComprasProductoDto } from './dto/update-agro-compras-producto.dto';
import { AgroComprasProducto } from './entities/agro-compras-producto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CompraDetalleAgroProducto } from './entities/compra-detalle-agro-producto.entity';
import { LoteAgroProducto } from './entities/lote-agro-compra.entity';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  AccionCompra,
  AuditoriaCompra,
} from './entities/audit-compras-agro-productos.entity';

@Injectable()
export class AgroComprasProductosService {
  constructor(
    @InjectRepository(AgroComprasProducto)
    private readonly compraRepository: Repository<AgroComprasProducto>,
    @InjectRepository(CompraDetalleAgroProducto)
    private readonly compraDetalleRepository: Repository<CompraDetalleAgroProducto>,
    @InjectRepository(LoteAgroProducto)
    private readonly loteRepository: Repository<LoteAgroProducto>,

    @InjectRepository(AgroSucursale)
    private readonly sucursalRepository: Repository<AgroSucursale>,
    @InjectRepository(AgroProveedore)
    private readonly proveedorRepository: Repository<AgroProveedore>,
    @InjectRepository(AuditoriaCompra)
    private readonly auditoriaRepo: Repository<AuditoriaCompra>,
    private readonly agroServicioService: AgroservicioValidationService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createCompraDto: CreateAgroComprasProductoDto,
    cliente: Cliente,
  ) {
    const propietarioId = cliente.id ?? '';
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

      const productosIds = createCompraDto.detalles.map((d) => d.productoId);
      const productosUnicos = new Set(productosIds);
      if (productosIds.length !== productosUnicos.size) {
        throw new BadRequestException('Productos duplicados en los detalles');
      }

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

        subtotalCompra += subtotalDetalle;
        impuestosCompra += Number(detalle.impuestos) || 0;
        descuentosCompra += Number(detalle.descuentos) || 0;

        return {
          ...detalle,
          cantidad_total,
          monto_total,
        };
      });

      const agroservicio =
        await this.agroServicioService.obtenerAgroservicio(propietarioId);

      const compra = this.compraRepository.create({
        ...createCompraDto,
        numero_factura: createCompraDto.numero_factura,
        subtotal: subtotalCompra,
        impuestos: impuestosCompra,
        descuentos: descuentosCompra,
        total: subtotalCompra - descuentosCompra + impuestosCompra,
        agroservicioId: agroservicio.id,
      });

      const compraGuardada = await queryRunner.manager.save(compra);

      for (const detalleCalculado of detallesCalculados) {
        const detalle = this.compraDetalleRepository.create({
          ...detalleCalculado,
          compraId: compraGuardada.id,
        });
        await queryRunner.manager.save(detalle);

        const costoRealPorUnidad =
          detalleCalculado.monto_total / detalleCalculado.cantidad_total;

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

  async createEmpleado(
    createCompraDto: CreateAgroComprasProductoDto,
    empleado: EmpleadosAgro,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
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

      const productosIds = createCompraDto.detalles.map((d) => d.productoId);
      const productosUnicos = new Set(productosIds);
      if (productosIds.length !== productosUnicos.size) {
        throw new BadRequestException('Productos duplicados en los detalles');
      }

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

        subtotalCompra += subtotalDetalle;
        impuestosCompra += Number(detalle.impuestos) || 0;
        descuentosCompra += Number(detalle.descuentos) || 0;

        return {
          ...detalle,
          cantidad_total,
          monto_total,
        };
      });

      const agroservicio =
        await this.agroServicioService.obtenerAgroservicio(propietarioId);

      const compra = this.compraRepository.create({
        ...createCompraDto,
        numero_factura: createCompraDto.numero_factura,
        subtotal: subtotalCompra,
        impuestos: impuestosCompra,
        descuentos: descuentosCompra,
        total: subtotalCompra - descuentosCompra + impuestosCompra,
        agroservicioId: agroservicio.id,
      });

      const compraGuardada = await queryRunner.manager.save(compra);

      for (const detalleCalculado of detallesCalculados) {
        const detalle = this.compraDetalleRepository.create({
          ...detalleCalculado,
          compraId: compraGuardada.id,
        });
        await queryRunner.manager.save(detalle);

        const costoRealPorUnidad =
          detalleCalculado.monto_total / detalleCalculado.cantidad_total;

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

      await queryRunner.manager.save(AuditoriaCompra, {
        compraId: compraGuardada.id,
        empleadoId: empleado.id,
        accion: AccionCompra.CREAR,
      });

      await queryRunner.commitTransaction();
      return await this.findOne(compraGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAuditoria(cliente: Cliente, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const query = this.auditoriaRepo
      .createQueryBuilder('auditoria')
      .leftJoin('auditoria.compra', 'compra')
      .leftJoin('compra.proveedor', 'proveedor')
      .leftJoin('auditoria.empleado', 'empleado')
      .leftJoin('empleado.role', 'rol')
      .leftJoin('compra.agroservicio', 'agroservicio')
      .where('agroservicio.propietarioId = :propietarioId', {
        propietarioId: cliente.id,
      })
      .select([
        'auditoria.id',
        'auditoria.accion',
        'auditoria.fecha',

        'compra.id',
        'compra.numero_factura',
        'compra.fecha',
        'compra.total',

        'proveedor.id',
        'proveedor.nombre_legal',

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

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      proveedor = '',
      sucursal = '',
      tipoPago = '',
    } = paginationDto;

    const agroservicio =
      await this.agroServicioService.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    try {
      const queryBuilder = this.compraRepository
        .createQueryBuilder('compra')
        .leftJoinAndSelect('compra.detalles', 'detalles')
        .leftJoinAndSelect('compra.lotes', 'lotes')
        .leftJoinAndSelect('compra.proveedor', 'proveedor')
        .leftJoinAndSelect('compra.sucursal', 'sucursal')
        .leftJoinAndSelect('compra.agroservicio', 'agroservicio')
        .orderBy('compra.created_at', 'DESC');

      queryBuilder.andWhere('compra.agroservicioId = :agroservicioId', {
        agroservicioId,
      });

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

  async update(id: string, updateCompraDto: UpdateAgroComprasProductoDto) {
    const compra = await this.findOne(id);

    Object.assign(compra, {
      ...updateCompraDto,
    });

    return await this.compraRepository.save(compra);
  }

  async remove(id: string): Promise<void> {
    const compra = await this.findOne(id);
    await this.compraRepository.remove(compra);
  }

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
      order: { id: 'ASC' },
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
