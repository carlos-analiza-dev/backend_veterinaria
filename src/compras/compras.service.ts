import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { Insumo } from '../insumos/entities/insumo.entity';

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
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
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
        const producto = await this.insumoRepository.findOne({
          where: { id: detalle.productoId },
        });
        if (!producto) {
          throw new NotFoundException(
            `Producto con ID ${detalle.productoId} no encontrado`,
          );
        }
      }

      // Crear la compra (encabezado)
      const compra = this.compraRepository.create({
        ...createCompraDto,
        createdById: user.id,
        updatedById: user.id,
      });

      // Calcular totales
      let subtotal = 0;
      const detallesCalculados = createCompraDto.detalles.map((detalle) => {
        console.log('Procesando detalle:', detalle);
        const bonificacion = detalle.bonificacion || 0;
        const cantidad_total = Number(detalle.cantidad) + Number(bonificacion);
        const descuentos = detalle.descuentos || 0;
        const impuestos = detalle.impuestos || 0;
        const monto_total = (cantidad_total * Number(detalle.costo_por_unidad)) - Number(descuentos) + Number(impuestos);
        
        console.log('Calculados:', { cantidad_total, monto_total });
        
        subtotal += monto_total;
        
        const resultado = {
          ...detalle,
          cantidad_total,
          monto_total,
        };
        
        console.log('Resultado del map:', resultado);
        
        return resultado;
      });

      // Aplicar descuentos e impuestos generales
      const descuentosGenerales = Number(createCompraDto.descuentos) || 0;
      const impuestosGenerales = Number(createCompraDto.impuestos) || 0;
      const total = subtotal - descuentosGenerales + impuestosGenerales;

      compra.subtotal = subtotal;
      compra.descuentos = descuentosGenerales;
      compra.impuestos = impuestosGenerales;
      compra.total = total;

      const compraGuardada = await queryRunner.manager.save(compra);

      // Crear los detalles
      for (const detalleCalculado of detallesCalculados) {
        console.log('Detalle calculado antes de crear entity:', detalleCalculado);
        
        const detalleData = {
          productoId: detalleCalculado.productoId,
          costo_por_unidad: detalleCalculado.costo_por_unidad,
          cantidad: detalleCalculado.cantidad,
          bonificacion: detalleCalculado.bonificacion || 0,
          descuentos: detalleCalculado.descuentos || 0,
          impuestos: detalleCalculado.impuestos || 0,
          cantidad_total: detalleCalculado.cantidad_total,
          monto_total: detalleCalculado.monto_total,
          compraId: compraGuardada.id,
          fecha_vencimiento: detalleCalculado.fecha_vencimiento 
            ? new Date(detalleCalculado.fecha_vencimiento) 
            : null,
        };
        
        console.log('Datos para crear entity:', detalleData);
        
        const detalle = this.compraDetalleRepository.create(detalleData);
        console.log('Entity creada:', detalle);
        
        await queryRunner.manager.save(detalle);

        // AQUÍ ES LA CLAVE: Por cada detalle, crear un lote automáticamente (SOLO 6 CAMPOS)
        const lote = this.loteRepository.create({
          id_compra: compraGuardada.id,
          id_sucursal: createCompraDto.sucursalId,
          id_producto: detalleCalculado.productoId,
          cantidad: detalleCalculado.cantidad_total, // cantidad + bonificación
          costo: detalleCalculado.costo_por_unidad,
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
      relations: [
        'detalles', 
        'detalles.producto', 
        'lotes', 
        'lotes.producto',
        'proveedor',
        'sucursal',
        'created_by',
      ],
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
    const whereCondition: any = { productoId };
    if (sucursalId) {
      whereCondition.sucursalId = sucursalId;
    }

    const lotes = await this.loteRepository.find({
      where: whereCondition,
      relations: ['producto', 'sucursal', 'compra'],
      order: { created_at: 'ASC' }, // Para mostrar por orden de llegada
    });

    const totalExistencia = lotes.reduce((total, lote) => {
      return total + Number(lote.cantidad_disponible);
    }, 0);

    return {
      producto: lotes[0]?.producto || null,
      sucursal: sucursalId ? lotes[0]?.sucursal || null : null,
      totalExistencia,
      lotes: lotes.map(lote => ({
        id: lote.id,
        compra: lote.compra.id,
        fechaCompra: lote.compra.fecha,
        cantidadOriginal: lote.cantidad,
        cantidadDisponible: lote.cantidad_disponible,
        costoUnitario: lote.costo,
        fechaVencimiento: lote.fecha_vencimiento,
      })),
    };
  }

  // Método para usar/vender productos (FIFO - lote más antiguo primero)
  async reducirInventario(productoId: string, sucursalId: string, cantidadSolicitada: number) {
    const lotes = await this.loteRepository.find({
      where: { 
        productoId, 
        sucursalId,
      },
      order: { created_at: 'ASC' }, // FIFO - primero el más antiguo
    });

    let cantidadPendiente = cantidadSolicitada;
    const lotesAfectados = [];

    for (const lote of lotes) {
      if (cantidadPendiente <= 0) break;
      if (lote.cantidad_disponible <= 0) continue;

      const cantidadARebajar = Math.min(cantidadPendiente, lote.cantidad_disponible);
      
      lote.cantidad_disponible -= cantidadARebajar;
      cantidadPendiente -= cantidadARebajar;

      await this.loteRepository.save(lote);
      lotesAfectados.push({
        loteId: lote.id,
        cantidadRebajada: cantidadARebajar,
        cantidadRestante: lote.cantidad_disponible,
      });
    }

    if (cantidadPendiente > 0) {
      throw new BadRequestException(
        `No hay suficiente inventario. Faltaron ${cantidadPendiente} unidades.`
      );
    }

    return {
      message: `Se redujeron ${cantidadSolicitada} unidades del inventario`,
      lotesAfectados,
    };
  }
}