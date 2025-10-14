import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductosNoVendidoDto } from './dto/create-productos_no_vendido.dto';
import { UpdateProductosNoVendidoDto } from './dto/update-productos_no_vendido.dto';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { ProductosNoVendido } from './entities/productos_no_vendido.entity';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class ProductosNoVendidosService {
  constructor(
    @InjectRepository(ProductosNoVendido)
    private readonly productosNoVendidosRepo: Repository<ProductosNoVendido>,

    @InjectRepository(SubServicio)
    private readonly subServicioRepo: Repository<SubServicio>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepo: Repository<Sucursal>,
  ) {}

  async create(createDto: CreateProductosNoVendidoDto) {
    const {
      producto_id,
      sucursal_id,
      cantidad_no_vendida,
      cantidad_solicitada,
    } = createDto;

    const producto = await this.subServicioRepo.findOne({
      where: { id: producto_id },
    });
    if (!producto) {
      throw new NotFoundException('El producto especificado no existe.');
    }

    const sucursal = await this.sucursalRepo.findOne({
      where: { id: sucursal_id },
    });
    if (!sucursal) {
      throw new NotFoundException('La sucursal especificada no existe.');
    }

    if (cantidad_no_vendida > cantidad_solicitada) {
      throw new BadRequestException(
        'La cantidad no vendida no puede ser mayor que la cantidad solicitada.',
      );
    }

    const total_perdido =
      createDto.total_perdido ??
      Number(
        (createDto.cantidad_no_vendida * createDto.precio_unitario).toFixed(2),
      );

    const nuevoRegistro = this.productosNoVendidosRepo.create({
      ...createDto,
      total_perdido,
    });

    return await this.productosNoVendidosRepo.save(nuevoRegistro);
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      fechaInicio,
      fechaFin,
      sucursal,
    } = paginationDto;

    const sucursalIdUsuario = user.sucursal?.id;

    const queryBuilder = this.productosNoVendidosRepo
      .createQueryBuilder('productoNoVendido')
      .leftJoinAndSelect('productoNoVendido.producto', 'producto')
      .leftJoinAndSelect('productoNoVendido.sucursal', 'sucursal')
      .orderBy('productoNoVendido.created_at', 'DESC')
      .take(limit)
      .skip(offset);

    if (sucursal) {
      queryBuilder.andWhere('sucursal.id = :sucursalId', {
        sucursalId: sucursal,
      });
    } else if (sucursalIdUsuario) {
      queryBuilder.andWhere('sucursal.id = :sucursalId', {
        sucursalId: sucursalIdUsuario,
      });
    }

    if (fechaInicio && fechaFin) {
      queryBuilder.andWhere(
        'DATE(productoNoVendido.created_at) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)',
        { fechaInicio, fechaFin },
      );
    } else if (fechaInicio) {
      queryBuilder.andWhere(
        'DATE(productoNoVendido.created_at) >= DATE(:fechaInicio)',
        {
          fechaInicio,
        },
      );
    } else if (fechaFin) {
      queryBuilder.andWhere(
        'DATE(productoNoVendido.created_at) <= DATE(:fechaFin)',
        {
          fechaFin,
        },
      );
    }

    const [productos, total] = await queryBuilder.getManyAndCount();

    return {
      productos,
      total,
    };
  }

  async findOne(id: string) {
    const registro = await this.productosNoVendidosRepo.findOne({
      where: { id },
      relations: ['producto'],
    });

    if (!registro) {
      throw new NotFoundException(
        `No se encontró el producto no vendido con ID ${id}.`,
      );
    }

    return registro;
  }

  async update(id: string, updateDto: UpdateProductosNoVendidoDto) {
    const registro = await this.productosNoVendidosRepo.findOne({
      where: { id },
    });

    if (!registro) {
      throw new NotFoundException(
        `No se puede actualizar: el producto no vendido con ID ${id} no existe.`,
      );
    }

    if (
      updateDto.cantidad_no_vendida &&
      updateDto.cantidad_solicitada &&
      updateDto.cantidad_no_vendida > updateDto.cantidad_solicitada
    ) {
      throw new BadRequestException(
        'La cantidad no vendida no puede ser mayor que la cantidad solicitada.',
      );
    }

    const actualizado = Object.assign(registro, updateDto);
    return await this.productosNoVendidosRepo.save(actualizado);
  }

  async remove(id: string) {
    const registro = await this.productosNoVendidosRepo.findOne({
      where: { id },
    });
    if (!registro) {
      throw new NotFoundException(
        `No se puede eliminar: el producto no vendido con ID ${id} no existe.`,
      );
    }

    await this.productosNoVendidosRepo.remove(registro);
    return {
      message: `Producto no vendido con ID ${id} eliminado exitosamente.`,
    };
  }
}
