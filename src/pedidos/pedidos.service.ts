import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido, EstadoPedido, TipoEntrega } from './entities/pedido.entity';
import { Repository, DataSource } from 'typeorm';
import { PedidoDetalle } from 'src/pedido_detalles/entities/pedido_detalle.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { instanceToPlain } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Lote } from 'src/lotes/entities/lote.entity';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { NotificacionesAdminsService } from 'src/notificaciones_admins/notificaciones_admins.service';
import { NotificationType } from 'src/interfaces/nptificaciones.type';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedido_repo: Repository<Pedido>,
    @InjectRepository(PedidoDetalle)
    private readonly pedido_detalle_repo: Repository<PedidoDetalle>,
    @InjectRepository(Cliente)
    private readonly cliente_repo: Repository<Cliente>,
    @InjectRepository(Sucursal)
    private readonly sucursal_repo: Repository<Sucursal>,
    @InjectRepository(SubServicio)
    private readonly subServicio_repo: Repository<SubServicio>,
    @InjectRepository(Lote)
    private readonly lote_repo: Repository<Lote>,
    private dataSource: DataSource,
    private notificacionService: NotificacionesAdminsService,
    private mailService: MailService,
  ) {}

  async create(createPedidoDto: CreatePedidoDto, cliente: Cliente) {
    const clienteId = getPropietarioId(cliente);
    const moneda = cliente.pais.simbolo_moneda ?? '$';
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cliente_existe = await this.cliente_repo.findOne({
        where: { id: clienteId },
      });

      if (!cliente_existe) {
        throw new NotFoundException(
          `Cliente con ID ${clienteId} no encontrado`,
        );
      }

      const sucursal_recibir = await this.sucursal_repo.findOne({
        where: { id: createPedidoDto.id_sucursal_cercana },
      });
      if (!sucursal_recibir)
        throw new BadRequestException(
          'La sucursal a seleccionar en tu producto es obligatoria',
        );

      let sub_total = 0;
      let importe_exento = 0;
      let importe_exonerado = 0;
      let importe_gravado_15 = 0;
      let importe_gravado_18 = 0;
      let isv_15 = 0;
      let isv_18 = 0;

      const detalles: PedidoDetalle[] = [];
      const lotesADescontar: { lote: Lote; cantidad: number }[] = [];

      for (const detalleDto of createPedidoDto.detalles) {
        const producto = await this.subServicio_repo.findOne({
          where: { id: detalleDto.id_producto },
          relations: ['tax'],
        });

        if (!producto) {
          throw new NotFoundException(
            `Producto con ID ${detalleDto.id_producto} no encontrado`,
          );
        }

        const sucursalId = detalleDto.id_sucursal;
        let sucursalNombre = 'Sin sucursal asignada';

        if (sucursalId) {
          const sucursal = await this.sucursal_repo.findOne({
            where: { id: sucursalId },
          });
          if (sucursal) {
            sucursalNombre = sucursal.nombre;
          }

          const lotes = await queryRunner.manager.find(Lote, {
            where: {
              id_producto: detalleDto.id_producto,
              id_sucursal: sucursalId,
            },
            order: {
              created_at: 'ASC',
            },
          });

          if (!lotes || lotes.length === 0) {
            throw new BadRequestException(
              `No hay stock disponible para el producto "${producto.nombre}" ` +
                `en la sucursal "${sucursalNombre}".`,
            );
          }

          const cantidadDisponible = lotes.reduce(
            (sum, lote) => sum + Number(lote.cantidad),
            0,
          );

          if (detalleDto.cantidad > cantidadDisponible) {
            throw new BadRequestException(
              `No hay suficiente stock para el producto "${producto.nombre}" ` +
                `en la sucursal "${sucursalNombre}". ` +
                `Disponible: ${cantidadDisponible}, Solicitado: ${detalleDto.cantidad}`,
            );
          }

          let cantidadPorDescontar = detalleDto.cantidad;
          for (const lote of lotes) {
            if (cantidadPorDescontar <= 0) break;

            const cantidadLote = Number(lote.cantidad);
            const cantidadADescontar = Math.min(
              cantidadLote,
              cantidadPorDescontar,
            );

            lotesADescontar.push({
              lote,
              cantidad: cantidadADescontar,
            });

            cantidadPorDescontar -= cantidadADescontar;
          }
        }

        const totalLinea = detalleDto.precio * detalleDto.cantidad;
        sub_total += totalLinea;

        if (producto.tax && producto.tax.porcentaje) {
          const porcentaje = Number(producto.tax.porcentaje);

          if (porcentaje === 0 || isNaN(porcentaje)) {
            importe_exento += totalLinea;
          } else if (porcentaje === 15) {
            importe_gravado_15 += totalLinea;
            isv_15 += totalLinea * 0.15;
          } else if (porcentaje === 18) {
            importe_gravado_18 += totalLinea;
            isv_18 += totalLinea * 0.18;
          }
        } else {
          importe_exento += totalLinea;
        }

        const detalle = this.pedido_detalle_repo.create({
          id_producto: detalleDto.id_producto,
          id_sucursal: detalleDto.id_sucursal,
          precio: detalleDto.precio,
          cantidad: detalleDto.cantidad,
          total: totalLinea,
        });

        detalles.push(detalle);
      }

      const costoDelivery = createPedidoDto.costo_delivery || 0;
      const totalCalculado = sub_total + isv_15 + isv_18 + costoDelivery;

      if (
        createPedidoDto.total &&
        Math.abs(totalCalculado - createPedidoDto.total) > 0.01
      ) {
        throw new BadRequestException(
          `El total enviado (${createPedidoDto.total}) no coincide con el total calculado (${totalCalculado.toFixed(2)}).`,
        );
      }

      const pedido = this.pedido_repo.create({
        cliente: { id: clienteId },
        id_sucursal_cercana: sucursal_recibir.id,
        sub_total,
        importe_exento,
        importe_exonerado,
        importe_gravado_15,
        importe_gravado_18,
        isv_15,
        isv_18,
        total: totalCalculado,
        estado: createPedidoDto.estado ?? EstadoPedido.PENDIENTE,
        direccion_entrega: createPedidoDto.direccion_entrega,
        latitud: createPedidoDto.latitud,
        longitud: createPedidoDto.longitud,
        tipo_entrega: createPedidoDto.tipo_entrega ?? TipoEntrega.RECOGER,
        costo_delivery: costoDelivery,
        nombre_finca: createPedidoDto.nombre_finca,
        creadoPorId: cliente.id,
      });

      const savedPedido = await queryRunner.manager.save(pedido);

      for (const detalle of detalles) {
        detalle.id_pedido = savedPedido.id;
      }
      await queryRunner.manager.save(PedidoDetalle, detalles);

      await this.notificacionService.notifyAdmins(
        NotificationType.NEW_ORDER,
        'Nuevo pedido recibido',
        `El cliente ${cliente.nombre} ha realizado un nuevo pedido`,
        sucursal_recibir.gerenteId,
      );

      try {
        const pedidoConDetalles = await queryRunner.manager.findOne(Pedido, {
          where: { id: savedPedido.id },
          relations: ['detalles', 'detalles.producto', 'sucursal'],
        });

        if (pedidoConDetalles) {
          await this.mailService.sendOrderConfirmation(
            cliente.email,
            cliente.nombre,
            {
              id: pedidoConDetalles.id,
              created_at: pedidoConDetalles.created_at,
              estado: pedidoConDetalles.estado,
              tipo_entrega: pedidoConDetalles.tipo_entrega,
              direccion_entrega: pedidoConDetalles.direccion_entrega,
              nombre_finca: pedidoConDetalles.nombre_finca,
              sucursal: pedidoConDetalles.sucursal,
              sub_total: Number(pedidoConDetalles.sub_total),
              importe_exento: Number(pedidoConDetalles.importe_exento),
              importe_exonerado: Number(pedidoConDetalles.importe_exonerado),
              importe_gravado_15: Number(pedidoConDetalles.importe_gravado_15),
              importe_gravado_18: Number(pedidoConDetalles.importe_gravado_18),
              isv_15: Number(pedidoConDetalles.isv_15),
              isv_18: Number(pedidoConDetalles.isv_18),
              total: Number(pedidoConDetalles.total),
              costo_delivery: Number(pedidoConDetalles.costo_delivery),
              detalles: pedidoConDetalles.detalles.map((det) => ({
                cantidad: det.cantidad,
                precio: Number(det.precio),
                producto: { nombre: det.producto?.nombre || 'Producto' },
              })),
            },
            moneda,
          );
        }
      } catch (emailError) {
        console.error('Error enviando correo de confirmación:', emailError);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Pedido creado exitosamente',
        pedido: savedPedido,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Pedido[]> {
    try {
      return await this.pedido_repo.find({
        relations: ['cliente', 'detalles', 'detalles.producto'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los pedidos');
    }
  }

  async findOne(id: string): Promise<Pedido> {
    try {
      const pedido = await this.pedido_repo.findOne({
        where: { id },
        relations: ['cliente', 'detalles', 'detalles.producto'],
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      return pedido;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el pedido');
    }
  }

  async findByCliente(cliente: Cliente, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, estado } = paginationDto;
    const clienteId = getPropietarioId(cliente);

    try {
      const [pedidos, total] = await this.pedido_repo.findAndCount({
        where: { cliente: { id: clienteId }, estado },
        relations: ['cliente', 'detalles', 'detalles.producto'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });

      if (pedidos.length === 0) {
        throw new NotFoundException(
          'No se encontraron pedidos para este cliente',
        );
      }

      return {
        total,
        pedidos: instanceToPlain(pedidos),
      };
    } catch (error) {
      throw error;
    }
  }

  async findBySucursal(sucursalId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, estado } = paginationDto;

    try {
      const query = this.pedido_repo
        .createQueryBuilder('pedido')

        .leftJoinAndSelect('pedido.cliente', 'cliente')
        .leftJoinAndSelect('pedido.sucursal', 'sucursal')
        .leftJoinAndSelect('pedido.detalles', 'detalles')
        .leftJoinAndSelect('detalles.producto', 'producto')
        .leftJoinAndSelect('detalles.sucursal', 'detalleSucursal')

        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('detalle.id_pedido')
            .from('pedido_detalles', 'detalle')
            .where('detalle.id_sucursal = :sucursalId')
            .getQuery();

          return 'pedido.id IN ' + subQuery;
        })
        .setParameter('sucursalId', sucursalId);

      if (estado) {
        query.andWhere('pedido.estado = :estado', { estado });
      }

      query.orderBy('pedido.created_at', 'DESC').take(limit).skip(offset);

      const [pedidos, total] = await query.getManyAndCount();

      return {
        total,
        pedidos: instanceToPlain(pedidos),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los pedidos de la sucursal',
      );
    }
  }

  async verificarCompraProducto(
    cliente: Cliente,
    productoId: string,
  ): Promise<boolean> {
    const clienteId = cliente.id;
    const compra = await this.pedido_detalle_repo
      .createQueryBuilder('detalle')
      .innerJoinAndSelect('detalle.pedido', 'pedido')
      .where('detalle.id_producto = :productoId', { productoId })
      .andWhere('pedido.id_cliente = :clienteId', { clienteId })
      .andWhere('pedido.estado = :facturado', { facturado: 'facturado' })
      .getOne();

    return !!compra;
  }

  async findByEstado(estado: EstadoPedido): Promise<Pedido[]> {
    try {
      return await this.pedido_repo.find({
        where: { estado },
        relations: ['cliente', 'detalles', 'detalles.producto'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los pedidos por estado',
      );
    }
  }

  async update(
    id: string,
    updatePedidoDto: UpdatePedidoDto,
    cliente: Cliente,
  ): Promise<Pedido> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pedido = await this.pedido_repo.findOne({
        where: { id },
        relations: ['detalles'],
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      if (
        pedido.estado !== EstadoPedido.PENDIENTE &&
        updatePedidoDto.detalles
      ) {
        throw new BadRequestException(
          `No se pueden modificar los detalles de un pedido en estado "${pedido.estado}". ` +
            `Solo los pedidos pendientes pueden ser modificados.`,
        );
      }

      if (updatePedidoDto.estado !== undefined) {
        pedido.estado = updatePedidoDto.estado;
      }

      if (updatePedidoDto.direccion_entrega !== undefined) {
        pedido.direccion_entrega = updatePedidoDto.direccion_entrega;
      }

      if (updatePedidoDto.latitud !== undefined) {
        pedido.latitud = updatePedidoDto.latitud;
      }

      if (updatePedidoDto.longitud !== undefined) {
        pedido.longitud = updatePedidoDto.longitud;
      }

      if (updatePedidoDto.tipo_entrega !== undefined) {
        pedido.tipo_entrega = updatePedidoDto.tipo_entrega;
      }

      if (updatePedidoDto.costo_delivery !== undefined) {
        pedido.costo_delivery = updatePedidoDto.costo_delivery;
      }

      if (updatePedidoDto.nombre_finca !== undefined) {
        pedido.nombre_finca = updatePedidoDto.nombre_finca;
      }

      if (updatePedidoDto.detalles && updatePedidoDto.detalles.length > 0) {
        for (const oldDetalle of pedido.detalles) {
          if (oldDetalle.id_sucursal) {
            const lotes = await queryRunner.manager.find(Lote, {
              where: {
                id_producto: oldDetalle.id_producto,
                id_sucursal: oldDetalle.id_sucursal,
              },
              order: { created_at: 'DESC' },
            });

            let cantidadPorDevolver = oldDetalle.cantidad;
            for (const lote of lotes) {
              if (cantidadPorDevolver <= 0) break;

              const cantidadLote = Number(lote.cantidad);
              const cantidadADevolver = Math.min(
                cantidadLote,
                cantidadPorDevolver,
              );

              await queryRunner.manager.update(Lote, lote.id, {
                cantidad: cantidadLote + cantidadADevolver,
              });

              cantidadPorDevolver -= cantidadADevolver;
            }
          }
        }

        let sub_total = 0;
        let importe_exento = 0;
        let importe_exonerado = 0;
        let importe_gravado_15 = 0;
        let importe_gravado_18 = 0;
        let isv_15 = 0;
        let isv_18 = 0;

        const nuevosDetalles: PedidoDetalle[] = [];
        const lotesADescontar: { lote: Lote; cantidad: number }[] = [];

        for (const detalleDto of updatePedidoDto.detalles) {
          if (!detalleDto.id_sucursal) {
            throw new BadRequestException(
              `Debes enviar la sucursal del producto con ID ${detalleDto.id_producto}.`,
            );
          }

          const sucursal = await this.sucursal_repo.findOne({
            where: { id: detalleDto.id_sucursal },
          });

          if (!sucursal) {
            throw new NotFoundException(
              `Sucursal con ID ${detalleDto.id_sucursal} no encontrada`,
            );
          }

          const producto = await this.subServicio_repo.findOne({
            where: { id: detalleDto.id_producto },
            relations: ['tax'],
          });

          if (!producto) {
            throw new NotFoundException(
              `Producto con ID ${detalleDto.id_producto} no encontrado`,
            );
          }

          const lotes = await queryRunner.manager.find(Lote, {
            where: {
              id_producto: detalleDto.id_producto,
              id_sucursal: detalleDto.id_sucursal,
            },
            order: { created_at: 'ASC' },
          });

          if (!lotes || lotes.length === 0) {
            throw new BadRequestException(
              `No hay stock disponible para el producto "${producto.nombre}" ` +
                `en la sucursal "${sucursal.nombre}".`,
            );
          }

          const cantidadDisponible = lotes.reduce(
            (sum, lote) => sum + Number(lote.cantidad),
            0,
          );

          if (detalleDto.cantidad > cantidadDisponible) {
            throw new BadRequestException(
              `No hay suficiente stock para el producto "${producto.nombre}" ` +
                `en la sucursal "${sucursal.nombre}". ` +
                `Disponible: ${cantidadDisponible}, Solicitado: ${detalleDto.cantidad}`,
            );
          }

          let cantidadPorDescontar = detalleDto.cantidad;
          for (const lote of lotes) {
            if (cantidadPorDescontar <= 0) break;

            const cantidadLote = Number(lote.cantidad);
            const cantidadADescontar = Math.min(
              cantidadLote,
              cantidadPorDescontar,
            );

            lotesADescontar.push({
              lote,
              cantidad: cantidadADescontar,
            });

            cantidadPorDescontar -= cantidadADescontar;
          }

          const totalLinea = detalleDto.precio * detalleDto.cantidad;
          sub_total += totalLinea;

          if (producto.tax && producto.tax.porcentaje) {
            const porcentaje = Number(producto.tax.porcentaje);

            if (porcentaje === 0 || isNaN(porcentaje)) {
              importe_exento += totalLinea;
            } else if (porcentaje === 15) {
              importe_gravado_15 += totalLinea;
              isv_15 += totalLinea * 0.15;
            } else if (porcentaje === 18) {
              importe_gravado_18 += totalLinea;
              isv_18 += totalLinea * 0.18;
            } else {
              importe_exento += totalLinea;
            }
          } else {
            importe_exento += totalLinea;
          }

          const detalle = this.pedido_detalle_repo.create({
            id_pedido: id,
            id_producto: detalleDto.id_producto,
            id_sucursal: detalleDto.id_sucursal,
            precio: detalleDto.precio,
            cantidad: detalleDto.cantidad,
            total: totalLinea,
          });

          nuevosDetalles.push(detalle);
        }

        await queryRunner.manager.delete(PedidoDetalle, { id_pedido: id });

        await queryRunner.manager.save(PedidoDetalle, nuevosDetalles);

        const totalCalculado =
          sub_total +
          isv_15 +
          isv_18 +
          (updatePedidoDto.costo_delivery ?? pedido.costo_delivery ?? 0);

        pedido.sub_total = sub_total;
        pedido.importe_exento = importe_exento;
        pedido.importe_exonerado = importe_exonerado;
        pedido.importe_gravado_15 = importe_gravado_15;
        pedido.importe_gravado_18 = importe_gravado_18;
        pedido.isv_15 = isv_15;
        pedido.isv_18 = isv_18;
        pedido.total = totalCalculado;

        for (const item of lotesADescontar) {
          const nuevaCantidad = Number(item.lote.cantidad) - item.cantidad;
          await queryRunner.manager.update(Lote, item.lote.id, {
            cantidad: nuevaCantidad,
          });
        }
      }

      pedido.actualizadoPorId = cliente.id;

      await queryRunner.manager.save(pedido);
      await queryRunner.commitTransaction();

      return await this.pedido_repo.findOne({
        where: { id },
        relations: [
          'cliente',
          'detalles',
          'detalles.producto',
          'detalles.producto.tax',
        ],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar el pedido');
    } finally {
      await queryRunner.release();
    }
  }

  async updateEstado(
    id: string,
    estado: EstadoPedido,
    cliente: Cliente,
  ): Promise<Pedido> {
    try {
      const pedido = await this.pedido_repo.findOne({ where: { id } });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      pedido.estado = estado;
      await this.pedido_repo.save({ ...pedido, actualizadoPorId: cliente.id });

      return await this.pedido_repo.findOne({
        where: { id },
        relations: ['cliente', 'detalles', 'detalles.producto'],
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar el estado del pedido',
      );
    }
  }

  async updateEstadoAdmin(id: string, estado: EstadoPedido): Promise<Pedido> {
    try {
      const pedido = await this.pedido_repo.findOne({
        where: { id },
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      pedido.estado = estado;
      await this.pedido_repo.save(pedido);

      const pedidoCompleto = await this.pedido_repo.findOne({
        where: { id },
        relations: ['cliente', 'sucursal', 'detalles', 'detalles.producto'],
      });

      if (!pedidoCompleto) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      try {
        await this.mailService.notificarCambioEstado(
          pedidoCompleto,
          pedidoCompleto.cliente,
          estado,
        );
      } catch (emailError) {
        console.error('Error enviando notificación de estado');
      }

      return pedidoCompleto;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Error al actualizar el estado del pedido',
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.pedido_repo.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el pedido');
    }
  }

  async getEstadisticas(): Promise<any> {
    try {
      const totalPedidos = await this.pedido_repo.count();

      const pedidosPorEstado = await this.pedido_repo
        .createQueryBuilder('pedido')
        .select('pedido.estado', 'estado')
        .addSelect('COUNT(pedido.id)', 'cantidad')
        .groupBy('pedido.estado')
        .getRawMany();

      const totalVentas = await this.pedido_repo
        .createQueryBuilder('pedido')
        .select('SUM(pedido.total)', 'totalVentas')
        .where('pedido.estado != :cancelado', {
          cancelado: EstadoPedido.CANCELADO,
        })
        .getRawOne();

      return {
        totalPedidos,
        pedidosPorEstado,
        totalVentas: parseFloat(totalVentas.totalVentas) || 0,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener estadísticas');
    }
  }
}
