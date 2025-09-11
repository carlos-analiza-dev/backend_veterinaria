import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDescuentosProductoDto } from './dto/create-descuentos_producto.dto';
import { UpdateDescuentosProductoDto } from './dto/update-descuentos_producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DescuentosProducto } from './entities/descuentos_producto.entity';
import { Repository } from 'typeorm';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Pai } from 'src/pais/entities/pai.entity';

@Injectable()
export class DescuentosProductoService {
  constructor(
    @InjectRepository(DescuentosProducto)
    private readonly descuentoRepository: Repository<DescuentosProducto>,
    @InjectRepository(SubServicio)
    private readonly productoRepository: Repository<SubServicio>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
  ) {}

  async create(createDescuentosProductoDto: CreateDescuentosProductoDto) {
    const {
      cantidad_comprada,
      descuentos,
      productoId,
      paisId,
      proveedorId,
      isActive,
    } = createDescuentosProductoDto;
    try {
      const producto_existe = await this.productoRepository.findOne({
        where: { id: productoId },
      });
      if (!producto_existe)
        throw new NotFoundException('No se encontro el producto seleccionado');

      const proveedor_existe = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_existe)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const pais_existe = await this.paisRepository.findOne({
        where: { id: paisId },
      });
      if (!pais_existe)
        throw new NotFoundException('No se encontro el pais seleccionado');

      const descuento = this.descuentoRepository.create({
        cantidad_comprada,
        descuentos,
        isActive,
        producto: producto_existe,
        pais: pais_existe,
        proveedor: proveedor_existe,
      });

      await this.descuentoRepository.save(descuento);

      return 'Descuento creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const descuentos = await this.descuentoRepository.find({
        relations: ['producto', 'proveedor', 'pais'],
        order: { id: 'ASC' },
      });

      if (descuentos.length === 0) {
        throw new NotFoundException('No se encontraron descuentos');
      }

      return descuentos;
    } catch (error) {
      throw error;
    }
  }

  async findDescuentoProducto(productoId: string) {
    try {
      const producto_existe = await this.productoRepository.findOne({
        where: { id: productoId },
      });
      if (!producto_existe)
        throw new NotFoundException('No se encontro el producto seleccionado');
      const descuentos = await this.descuentoRepository.find({
        where: { producto: { id: productoId } },
        relations: ['producto', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (descuentos.length === 0) {
        throw new NotFoundException('No se encontraron descuentos');
      }

      return descuentos;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const descuento = await this.descuentoRepository.findOne({
        where: { id },
        relations: ['producto'],
      });

      if (!descuento) {
        throw new NotFoundException(`Descuento con ID ${id} no encontrado`);
      }

      return descuento;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateDescuentosProductoDto: UpdateDescuentosProductoDto,
  ) {
    try {
      const { cantidad_comprada, descuentos, productoId, isActive } =
        updateDescuentosProductoDto;

      const descuentoExistente = await this.descuentoRepository.findOne({
        where: { id },
        relations: ['producto'],
      });

      if (!descuentoExistente) {
        throw new NotFoundException(`Descuento con ID ${id} no encontrado`);
      }

      if (productoId && productoId !== descuentoExistente.producto.id) {
        const nuevoProducto = await this.productoRepository.findOne({
          where: { id: productoId },
        });

        if (!nuevoProducto) {
          throw new NotFoundException(
            'No se encontro el producto seleccionado',
          );
        }

        const descuentoDuplicado = await this.descuentoRepository.findOne({
          where: { producto: { id: productoId } },
        });

        if (descuentoDuplicado && descuentoDuplicado.id !== id) {
          throw new BadRequestException(
            'El nuevo producto ya tiene un descuento asignado',
          );
        }

        descuentoExistente.producto = nuevoProducto;
      }

      if (cantidad_comprada !== undefined) {
        descuentoExistente.cantidad_comprada = cantidad_comprada;
      }

      if (descuentos !== undefined) {
        descuentoExistente.descuentos = descuentos;
      }

      if (isActive !== undefined) {
        descuentoExistente.isActive = isActive;
      }

      await this.descuentoRepository.save(descuentoExistente);

      return 'Descuento actualizado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const descuento = await this.descuentoRepository.findOne({
        where: { id },
      });

      if (!descuento) {
        throw new NotFoundException(`Descuento con ID ${id} no encontrado`);
      }

      await this.descuentoRepository.remove(descuento);

      return 'Descuento eliminado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findByProducto(productoId: string) {
    try {
      const producto = await this.productoRepository.findOne({
        where: { id: productoId },
      });

      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }

      const descuento = await this.descuentoRepository.findOne({
        where: { producto: { id: productoId } },
        relations: ['producto'],
      });

      if (!descuento) {
        throw new NotFoundException(
          'No se encontró descuento para este producto',
        );
      }

      return descuento;
    } catch (error) {
      throw error;
    }
  }
}
