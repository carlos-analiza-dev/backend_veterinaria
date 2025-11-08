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
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cliente = await this.cliente_repo.findOne({
        where: { id: createPedidoDto.id_cliente },
      });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID ${createPedidoDto.id_cliente} no encontrado`,
        );
      }

      let sucursal: Sucursal | null = null;
      if (createPedidoDto.id_sucursal) {
        sucursal = await this.sucursal_repo.findOne({
          where: { id: createPedidoDto.id_sucursal },
        });

        if (!sucursal) {
          throw new NotFoundException(
            `Sucursal con ID ${createPedidoDto.id_sucursal} no encontrada`,
          );
        }
      }

      const pedido = this.pedido_repo.create({
        id_cliente: createPedidoDto.id_cliente,
        id_sucursal: createPedidoDto.id_sucursal,
        total: createPedidoDto.total,
        estado: createPedidoDto.estado ?? EstadoPedido.PENDIENTE,
        direccion_entrega: createPedidoDto.direccion_entrega,
        latitud: createPedidoDto.latitud,
        longitud: createPedidoDto.longitud,
        tipo_entrega: createPedidoDto.tipo_entrega ?? TipoEntrega.RECOGER,
        costo_delivery: createPedidoDto.costo_delivery,
        nombre_finca: createPedidoDto.nombre_finca,
      });

      const savedPedido = await queryRunner.manager.save(pedido);

      const detalles: PedidoDetalle[] = [];
      let totalCalculado = 0;

      for (const detalleDto of createPedidoDto.detalles) {
        const producto = await this.subServicio_repo.findOne({
          where: { id: detalleDto.id_producto },
        });

        if (!producto) {
          throw new NotFoundException(
            `Producto con ID ${detalleDto.id_producto} no encontrado`,
          );
        }

        if (createPedidoDto.id_sucursal) {
          const lotes = await queryRunner.manager.find(Lote, {
            where: {
              id_producto: detalleDto.id_producto,
              id_sucursal: createPedidoDto.id_sucursal,
            },
          });

          const cantidadDisponible = lotes.reduce(
            (sum, lote) => sum + Number(lote.cantidad),
            0,
          );

          if (detalleDto.cantidad > cantidadDisponible) {
            throw new BadRequestException(
              `No hay suficiente stock en la sucursal. 
        Producto: ${producto.nombre} 
        Disponible: ${cantidadDisponible} 
        Solicitado: ${detalleDto.cantidad}`,
            );
          }
        }

        const detalle = this.pedido_detalle_repo.create({
          id_pedido: savedPedido.id,
          id_producto: detalleDto.id_producto,
          precio: detalleDto.precio,
          cantidad: detalleDto.cantidad,
          total: detalleDto.precio * detalleDto.cantidad,
        });

        totalCalculado += detalle.total;
        detalles.push(detalle);
      }

      const totalEsperado =
        totalCalculado + (createPedidoDto.costo_delivery ?? 0);

      if (Math.abs(totalEsperado - createPedidoDto.total) > 0.01) {
        throw new BadRequestException(
          `El total proporcionado (${
            createPedidoDto.total
          }) no coincide con la suma de los detalles (${totalCalculado}) más el costo de delivery (${
            createPedidoDto.costo_delivery ?? 0
          }).`,
        );
      }

      await queryRunner.manager.save(PedidoDetalle, detalles);

      await queryRunner.commitTransaction();

      return 'Pedido Creado Exitosamente';
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear el pedido');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Pedido[]> {
    try {
      return await this.pedido_repo.find({
        relations: ['cliente', 'sucursal', 'detalles', 'detalles.producto'],
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
        relations: ['cliente', 'sucursal', 'detalles', 'detalles.producto'],
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
    const clienteId = cliente.id;

    try {
      const [pedidos, total] = await this.pedido_repo.findAndCount({
        where: { id_cliente: clienteId, estado },
        relations: ['cliente', 'sucursal', 'detalles', 'detalles.producto'],
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
      throw new InternalServerErrorException(
        'Error al obtener los pedidos del cliente',
      );
    }
  }

  async findBySucursal(sucursalId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, estado } = paginationDto;

    try {
      const [pedidos, total] = await this.pedido_repo.findAndCount({
        where: { id_sucursal: sucursalId, estado },
        relations: ['cliente', 'sucursal', 'detalles', 'detalles.producto'],
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });

      if (pedidos.length === 0) {
        throw new NotFoundException(
          'No se encontraron pedidos para esta sucursal',
        );
      }

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

  async findByEstado(estado: EstadoPedido): Promise<Pedido[]> {
    try {
      return await this.pedido_repo.find({
        where: { estado },
        relations: ['cliente', 'sucursal', 'detalles', 'detalles.producto'],
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

  async update(id: string, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
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

      if (updatePedidoDto.estado !== undefined) {
        pedido.estado = updatePedidoDto.estado;
      }

      if (updatePedidoDto.id_sucursal !== undefined) {
        if (updatePedidoDto.id_sucursal) {
          const sucursal = await this.sucursal_repo.findOne({
            where: { id: updatePedidoDto.id_sucursal },
          });

          if (!sucursal) {
            throw new NotFoundException(
              `Sucursal con ID ${updatePedidoDto.id_sucursal} no encontrada`,
            );
          }
        }
        pedido.id_sucursal = updatePedidoDto.id_sucursal;
      }

      if (updatePedidoDto.detalles && updatePedidoDto.detalles.length > 0) {
        await queryRunner.manager.delete(PedidoDetalle, { id_pedido: id });

        let nuevoTotal = 0;
        const nuevosDetalles: PedidoDetalle[] = [];

        for (const detalleDto of updatePedidoDto.detalles) {
          const producto = await this.subServicio_repo.findOne({
            where: { id: detalleDto.id_producto },
          });

          if (!producto) {
            throw new NotFoundException(
              `Producto con ID ${detalleDto.id_producto} no encontrado`,
            );
          }

          const detalle = this.pedido_detalle_repo.create({
            id_pedido: id,
            id_producto: detalleDto.id_producto,
            precio: detalleDto.precio,
            cantidad: detalleDto.cantidad,
            total: detalleDto.precio * detalleDto.cantidad,
          });

          nuevoTotal += detalle.total;
          nuevosDetalles.push(detalle);
        }

        await queryRunner.manager.save(PedidoDetalle, nuevosDetalles);
        pedido.total = nuevoTotal;
      }

      const updatedPedido = await queryRunner.manager.save(pedido);
      await queryRunner.commitTransaction();

      return await this.pedido_repo.findOne({
        where: { id },
        relations: ['cliente', 'sucursal', 'detalles', 'detalles.producto'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar el pedido');
    } finally {
      await queryRunner.release();
    }
  }

  async updateEstado(id: string, estado: EstadoPedido): Promise<Pedido> {
    try {
      const pedido = await this.pedido_repo.findOne({ where: { id } });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      pedido.estado = estado;
      await this.pedido_repo.save(pedido);

      return await this.pedido_repo.findOne({
        where: { id },
        relations: ['cliente', 'sucursal', 'detalles', 'detalles.producto'],
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
