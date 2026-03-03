import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductoVentaDto } from './dto/create-producto_venta.dto';
import { UpdateProductoVentaDto } from './dto/update-producto_venta.dto';
import { ProductoVenta } from './entities/producto_venta.entity';
import { ProductosGanaderia } from 'src/productos_ganaderia/entities/productos_ganaderia.entity';

@Injectable()
export class ProductoVentasService {
  constructor(
    @InjectRepository(ProductoVenta)
    private readonly ventaRepository: Repository<ProductoVenta>,

    @InjectRepository(ProductosGanaderia)
    private readonly productoRepository: Repository<ProductosGanaderia>,
  ) {}

  async create(dto: CreateProductoVentaDto) {
    try {
      const producto = await this.productoRepository.findOneBy({
        id: dto.productoId,
      });

      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }

      const existeVenta = await this.ventaRepository.findOne({
        where: {
          producto: { id: dto.productoId },
          unidadMedida: dto.unidadMedida,
        },
      });

      if (existeVenta) {
        throw new BadRequestException(
          `Ya existe un precio para la unidad ${dto.unidadMedida}`,
        );
      }

      const venta = this.ventaRepository.create({
        unidadMedida: dto.unidadMedida,
        precio: dto.precio,
        moneda: dto.moneda ?? 'L',
        producto,
      });

      await this.ventaRepository.save(venta);

      return 'Precio Agregado con Exito';
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await this.ventaRepository.find({
      relations: ['producto'],
      order: { precio: 'ASC' },
    });
  }

  async findOne(id: string) {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['producto'],
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    return venta;
  }

  async update(id: string, dto: UpdateProductoVentaDto) {
    const venta = await this.findOne(id);

    if (dto.productoId) {
      const producto = await this.productoRepository.findOneBy({
        id: dto.productoId,
      });

      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }

      venta.producto = producto;
    }

    Object.assign(venta, {
      unidadMedida: dto.unidadMedida ?? venta.unidadMedida,
      precio: dto.precio ?? venta.precio,
      moneda: dto.moneda ?? venta.moneda,
    });

    return await this.ventaRepository.save(venta);
  }

  async remove(id: string) {
    const venta = await this.findOne(id);

    await this.ventaRepository.remove(venta);

    return {
      message: 'Venta eliminada correctamente',
    };
  }
}
