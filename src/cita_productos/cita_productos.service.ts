import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCitaProductoDto } from './dto/create-cita_producto.dto';
import { UpdateCitaProductoDto } from './dto/update-cita_producto.dto';
import { CitaProducto } from './entities/cita_producto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from 'src/citas/entities/cita.entity';
import { ProductosAgroservicio } from 'src/productos_agroservicio/entities/productos_agroservicio.entity';
import { InventarioProducto } from 'src/inventario_productos/entities/inventario_producto.entity';
import { CitaProductoResponseDto } from './dto/cita-producto-response.dto';

@Injectable()
export class CitaProductosService {
  constructor(
    @InjectRepository(CitaProducto)
    private readonly citaProductoRepository: Repository<CitaProducto>,
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
    @InjectRepository(ProductosAgroservicio)
    private readonly productoRepository: Repository<ProductosAgroservicio>,
    @InjectRepository(InventarioProducto)
    private readonly inventarioRepository: Repository<InventarioProducto>,
  ) {}

  async create(createCitaProductoDto: CreateCitaProductoDto) {
    const cita = await this.citaRepository.findOne({
      where: { id: createCitaProductoDto.citaId },
    });
    if (!cita) {
      throw new NotFoundException(
        `Cita con ID ${createCitaProductoDto.citaId} no encontrada`,
      );
    }

    const producto = await this.productoRepository.findOne({
      where: { id: createCitaProductoDto.productoId },
      relations: ['inventario'],
    });
    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${createCitaProductoDto.productoId} no encontrado`,
      );
    }

    if (
      !producto.inventario ||
      producto.inventario.cantidadDisponible < createCitaProductoDto.cantidad
    ) {
      throw new NotFoundException(
        `No hay suficiente stock del producto ${producto.nombre}`,
      );
    }

    const citaProducto = this.citaProductoRepository.create({
      cita: { id: createCitaProductoDto.citaId },
      producto: { id: createCitaProductoDto.productoId },
      cantidad: createCitaProductoDto.cantidad,
      precioUnitario: createCitaProductoDto.precioUnitario,
    });

    await this.inventarioRepository.decrement(
      { id: producto.inventario.id },
      'cantidadDisponible',
      createCitaProductoDto.cantidad,
    );

    const saved = await this.citaProductoRepository.save(citaProducto);
    return this.mapToResponseDto(saved);
  }

  async findAllByCita(citaId: string) {
    const citaProductos = await this.citaProductoRepository.find({
      where: { cita: { id: citaId } },
      relations: ['producto'],
    });

    return citaProductos.map((ci) => this.mapToResponseDto(ci));
  }

  async findOne(id: string) {
    const citaProducto = await this.citaProductoRepository.findOne({
      where: { id },
      relations: ['producto'],
    });

    if (!citaProducto) {
      throw new NotFoundException(
        `Cita de producto con ID ${id} no encontrado`,
      );
    }

    return this.mapToResponseDto(citaProducto);
  }

  async update(id: string, updateCitaProductoDto: UpdateCitaProductoDto) {
    const citaProducto = await this.citaProductoRepository.findOne({
      where: { id },
      relations: ['producto', 'producto.inventario'],
    });

    if (!citaProducto) {
      throw new NotFoundException(`Cita producto con ID ${id} no encontrado`);
    }

    if (updateCitaProductoDto.cantidad !== undefined) {
      const diferencia = updateCitaProductoDto.cantidad - citaProducto.cantidad;
      await this.inventarioRepository.manager.transaction(async (manager) => {
        await manager.decrement(
          InventarioProducto,
          { id: citaProducto.producto.inventario.id },
          'cantidadDisponible',
          diferencia,
        );
      });
    }

    const updated = await this.citaProductoRepository.save({
      ...citaProducto,
      ...updateCitaProductoDto,
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string) {
    const citaProducto = await this.citaProductoRepository.findOne({
      where: { id },
      relations: ['producto', 'producto.inventario'],
    });

    if (!citaProducto) {
      throw new NotFoundException(`Cita producto con ID ${id} no encontrado`);
    }

    await this.inventarioRepository.increment(
      { id: citaProducto.producto.inventario.id },
      'cantidadDisponible',
      citaProducto.cantidad,
    );

    await this.citaProductoRepository.delete(id);
    return { message: 'Cita producto eliminado correctamente' };
  }

  private mapToResponseDto(
    citaProducto: CitaProducto,
  ): CitaProductoResponseDto {
    return {
      id: citaProducto.id,
      citaId: citaProducto.cita.id,
      productoId: citaProducto.producto.id,
      productoNombre: citaProducto.producto.nombre,
      cantidad: citaProducto.cantidad,
      precioUnitario: citaProducto.precioUnitario,
      subtotal: citaProducto.cantidad * citaProducto.precioUnitario,
    };
  }
}
