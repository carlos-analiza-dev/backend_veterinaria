import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/auth/entities/auth.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { SearchLoteDto } from './dto/search-lote.dto';
import { EstadoLote, Lote } from './entities/lote.entity';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepo: Repository<Lote>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
  ) {}

  async create(createLoteDto: CreateLoteDto, userId: string) {
    const {
      numero_lote_color,
      productoId,
      proveedorId,
      orden_compra_id,
      fecha_compra,
      fecha_vencimiento,
      cantidad_total,
      cantidad_disponible,
      unidad_medida,
      costo_unitario,
      moneda,
      ubicacion,
      estatus,
      numero_registro_sanitario,
    } = createLoteDto;

    try {
      // Verificar que el usuario existe
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar que el producto existe
      const producto = await this.insumoRepo.findOneBy({ id: productoId });
      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }

      // Verificar que el proveedor existe
      const proveedor = await this.proveedorRepo.findOneBy({
        id: proveedorId,
      });
      if (!proveedor) {
        throw new NotFoundException('Proveedor no encontrado');
      }

      // Validar que la cantidad disponible no sea mayor que la total
      if (cantidad_disponible > cantidad_total) {
        throw new BadRequestException(
          'La cantidad disponible no puede ser mayor que la cantidad total',
        );
      }

      // Validar fechas
      const fechaCompra = new Date(fecha_compra);
      let fechaVenc = null;
      if (fecha_vencimiento) {
        fechaVenc = new Date(fecha_vencimiento);
        if (fechaVenc <= fechaCompra) {
          throw new BadRequestException(
            'La fecha de vencimiento debe ser posterior a la fecha de compra',
          );
        }
      }

      // Verificar que no exista un lote con el mismo número para el mismo producto
      const existeLote = await this.loteRepo.findOne({
        where: {
          numero_lote_color,
          producto: { id: productoId },
        },
      });

      if (existeLote) {
        throw new ConflictException(
          `Ya existe un lote con el número ${numero_lote_color} para este producto`,
        );
      }

      // Crear el lote
      const nuevoLote = this.loteRepo.create({
        numero_lote_color,
        orden_compra_id,
        fecha_compra: fechaCompra,
        fecha_vencimiento: fechaVenc,
        cantidad_total,
        cantidad_disponible,
        unidad_medida,
        costo_unitario,
        moneda,
        ubicacion,
        estatus: estatus || EstadoLote.ACTIVO,
        numero_registro_sanitario,
        producto,
        proveedor,
        created_by: user,
        updated_by: user,
      });

      await this.loteRepo.save(nuevoLote);

      return {
        message: 'Lote creado exitosamente',
        lote: instanceToPlain(nuevoLote),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(searchLoteDto: SearchLoteDto) {
    const {
      limit = 10,
      offset = 0,
      search,
      productoId,
      proveedorId,
      estatus,
      vencidosProximos,
    } = searchLoteDto;

    try {
      const query = this.loteRepo
        .createQueryBuilder('lote')
        .leftJoinAndSelect('lote.producto', 'producto')
        .leftJoinAndSelect('lote.proveedor', 'proveedor')
        .leftJoinAndSelect('lote.created_by', 'created_by')
        .leftJoinAndSelect('lote.updated_by', 'updated_by');

      let whereConditions: string[] = [];
      const parameters: {
        productoId?: string;
        proveedorId?: string;
        estatus?: EstadoLote;
        search?: string;
      } = {};

      // Filtro por producto
      if (productoId) {
        const producto = await this.insumoRepo.findOneBy({ id: productoId });
        if (!producto) {
          throw new NotFoundException('Producto no encontrado');
        }
        whereConditions.push('lote.producto.id = :productoId');
        parameters.productoId = productoId;
      }

      // Filtro por proveedor
      if (proveedorId) {
        const proveedor = await this.proveedorRepo.findOneBy({
          id: proveedorId,
        });
        if (!proveedor) {
          throw new NotFoundException('Proveedor no encontrado');
        }
        whereConditions.push('lote.proveedor.id = :proveedorId');
        parameters.proveedorId = proveedorId;
      }

      // Filtro por estatus
      if (estatus) {
        whereConditions.push('lote.estatus = :estatus');
        parameters.estatus = estatus;
      }

      // Filtro por búsqueda general
      if (search && search.trim() !== '') {
        whereConditions.push(
          '(LOWER(lote.numero_lote_color) LIKE LOWER(:search) OR ' +
            'LOWER(lote.orden_compra_id) LIKE LOWER(:search) OR ' +
            'LOWER(producto.nombre) LIKE LOWER(:search) OR ' +
            'LOWER(proveedor.nombre_legal) LIKE LOWER(:search))',
        );
        parameters.search = `%${search}%`;
      }

      // Filtro por lotes vencidos o próximos a vencer (30 días)
      if (vencidosProximos) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + 30);
        whereConditions.push(
          '(lote.fecha_vencimiento IS NOT NULL AND lote.fecha_vencimiento <= :fechaLimite)',
        );
        query.setParameter('fechaLimite', fechaLimite);
      }

      // Aplicar condiciones WHERE
      if (whereConditions.length > 0) {
        query.where(whereConditions.join(' AND '), parameters);
      }

      const total = await query.getCount();

      const lotes = await query
        .orderBy('lote.created_at', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      return {
        data: instanceToPlain(lotes),
        total,
        limit,
        offset,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const lote = await this.loteRepo.findOne({
        where: { id },
        relations: [
          'producto',
          'proveedor',
          'created_by',
          'updated_by',
        ],
      });

      if (!lote) {
        throw new NotFoundException('Lote no encontrado');
      }

      return instanceToPlain(lote);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateLoteDto: UpdateLoteDto, userId: string) {
    const {
      numero_lote_color,
      productoId,
      proveedorId,
      orden_compra_id,
      fecha_compra,
      fecha_vencimiento,
      cantidad_total,
      cantidad_disponible,
      unidad_medida,
      costo_unitario,
      moneda,
      ubicacion,
      estatus,
      numero_registro_sanitario,
    } = updateLoteDto;

    try {
      // Verificar que el lote existe
      const lote = await this.loteRepo.findOne({
        where: { id },
        relations: ['producto', 'proveedor'],
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${id} no encontrado`);
      }

      // Verificar que el usuario existe
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar producto si se está actualizando
      if (productoId !== undefined) {
        const producto = await this.insumoRepo.findOneBy({ id: productoId });
        if (!producto) {
          throw new NotFoundException('Producto no encontrado');
        }
        lote.producto = producto;
      }

      // Verificar proveedor si se está actualizando
      if (proveedorId !== undefined) {
        const proveedor = await this.proveedorRepo.findOneBy({
          id: proveedorId,
        });
        if (!proveedor) {
          throw new NotFoundException('Proveedor no encontrado');
        }
        lote.proveedor = proveedor;
      }

      // Validar que la cantidad disponible no sea mayor que la total
      const nuevaCantidadTotal = cantidad_total ?? lote.cantidad_total;
      const nuevaCantidadDisponible =
        cantidad_disponible ?? lote.cantidad_disponible;

      if (nuevaCantidadDisponible > nuevaCantidadTotal) {
        throw new BadRequestException(
          'La cantidad disponible no puede ser mayor que la cantidad total',
        );
      }

      // Validar fechas si se están actualizando
      let fechaCompra = lote.fecha_compra;
      let fechaVenc = lote.fecha_vencimiento;

      if (fecha_compra !== undefined) {
        fechaCompra = new Date(fecha_compra);
      }

      if (fecha_vencimiento !== undefined) {
        fechaVenc = fecha_vencimiento ? new Date(fecha_vencimiento) : null;
        if (fechaVenc && fechaVenc <= fechaCompra) {
          throw new BadRequestException(
            'La fecha de vencimiento debe ser posterior a la fecha de compra',
          );
        }
      }

      // Verificar duplicados de número de lote si se está cambiando
      if (
        numero_lote_color &&
        numero_lote_color !== lote.numero_lote_color
      ) {
        const existeLote = await this.loteRepo.findOne({
          where: {
            numero_lote_color,
            producto: { id: lote.producto.id },
          },
        });

        if (existeLote && existeLote.id !== id) {
          throw new ConflictException(
            `Ya existe otro lote con el número ${numero_lote_color} para este producto`,
          );
        }
      }

      // Actualizar campos
      if (numero_lote_color !== undefined)
        lote.numero_lote_color = numero_lote_color;
      if (orden_compra_id !== undefined)
        lote.orden_compra_id = orden_compra_id;
      if (fecha_compra !== undefined) lote.fecha_compra = fechaCompra;
      if (fecha_vencimiento !== undefined) lote.fecha_vencimiento = fechaVenc;
      if (cantidad_total !== undefined) lote.cantidad_total = cantidad_total;
      if (cantidad_disponible !== undefined)
        lote.cantidad_disponible = cantidad_disponible;
      if (unidad_medida !== undefined) lote.unidad_medida = unidad_medida;
      if (costo_unitario !== undefined) lote.costo_unitario = costo_unitario;
      if (moneda !== undefined) lote.moneda = moneda;
      if (ubicacion !== undefined) lote.ubicacion = ubicacion;
      if (estatus !== undefined) lote.estatus = estatus;
      if (numero_registro_sanitario !== undefined)
        lote.numero_registro_sanitario = numero_registro_sanitario;

      // Actualizar el usuario que modifica
      lote.updated_by = user;

      await this.loteRepo.save(lote);

      return {
        message: 'Lote actualizado correctamente',
        lote: instanceToPlain(lote),
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      const lote = await this.loteRepo.findOne({
        where: { id },
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${id} no encontrado`);
      }

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Cambiar estado a RETIRADO en lugar de eliminar físicamente
      lote.estatus = EstadoLote.RETIRADO;
      lote.updated_by = user;

      await this.loteRepo.save(lote);

      return {
        message: 'Lote retirado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  async restore(id: string, userId: string) {
    try {
      const lote = await this.loteRepo.findOne({
        where: { id },
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${id} no encontrado`);
      }

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Restaurar a ACTIVO
      lote.estatus = EstadoLote.ACTIVO;
      lote.updated_by = user;

      await this.loteRepo.save(lote);

      return {
        message: 'Lote restaurado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  async adjustQuantity(
    id: string,
    cantidad: number,
    userId: string,
    operacion: 'sumar' | 'restar',
  ) {
    try {
      const lote = await this.loteRepo.findOne({
        where: { id },
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${id} no encontrado`);
      }

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      let nuevaCantidad = lote.cantidad_disponible;

      if (operacion === 'sumar') {
        nuevaCantidad += cantidad;
        if (nuevaCantidad > lote.cantidad_total) {
          throw new BadRequestException(
            'La cantidad disponible no puede ser mayor que la cantidad total',
          );
        }
      } else {
        nuevaCantidad -= cantidad;
        if (nuevaCantidad < 0) {
          throw new BadRequestException(
            'La cantidad disponible no puede ser negativa',
          );
        }
      }

      lote.cantidad_disponible = nuevaCantidad;
      lote.updated_by = user;

      // Actualizar estado si se agotó
      if (nuevaCantidad === 0) {
        lote.estatus = EstadoLote.AGOTADO;
      } else if (lote.estatus === EstadoLote.AGOTADO && nuevaCantidad > 0) {
        lote.estatus = EstadoLote.ACTIVO;
      }

      await this.loteRepo.save(lote);

      return {
        message: `Cantidad ${operacion === 'sumar' ? 'aumentada' : 'reducida'} correctamente`,
        lote: instanceToPlain(lote),
      };
    } catch (error) {
      throw error;
    }
  }
}