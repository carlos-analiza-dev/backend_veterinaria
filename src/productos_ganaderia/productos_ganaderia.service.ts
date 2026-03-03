import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductosGanaderiaDto } from './dto/create-productos_ganaderia.dto';
import { UpdateProductosGanaderiaDto } from './dto/update-productos_ganaderia.dto';
import { ProductosGanaderia } from './entities/productos_ganaderia.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class ProductosGanaderiaService {
  constructor(
    @InjectRepository(ProductosGanaderia)
    private readonly productoRepository: Repository<ProductosGanaderia>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(dto: CreateProductosGanaderiaDto, cliente: Cliente) {
    try {
      const clienteId = cliente.id;
      const propietario = await this.clienteRepository.findOneBy({
        id: clienteId,
      });

      if (!propietario) {
        throw new NotFoundException('Propietario no encontrado');
      }

      const producto = this.productoRepository.create({
        ...dto,
        propietario: cliente,
      });

      await this.productoRepository.save(producto);

      return 'Producto Creado con Exito';
    } catch (error) {
      throw error;
    }
  }

  async findAll(cliente: Cliente) {
    const clienteId = cliente.id;
    return await this.productoRepository.find({
      where: {
        propietario: { id: clienteId },
      },
      relations: ['ventas'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string, cliente: Cliente) {
    const clienteId = cliente.id;
    const producto = await this.productoRepository.findOne({
      where: {
        id,
        propietario: { id: clienteId },
      },
      relations: ['ventas'],
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async update(id: string, dto: UpdateProductosGanaderiaDto, cliente: Cliente) {
    const producto = await this.findOne(id, cliente);

    Object.assign(producto, dto);

    return await this.productoRepository.save(producto);
  }

  async remove(id: string, cliente: Cliente) {
    const producto = await this.findOne(id, cliente);

    return await this.productoRepository.save(producto);
  }
}
