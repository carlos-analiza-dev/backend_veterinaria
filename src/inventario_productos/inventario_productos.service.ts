import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventarioProductoDto } from './dto/create-inventario_producto.dto';
import { UpdateInventarioProductoDto } from './dto/update-inventario_producto.dto';
import { InventarioProducto } from './entities/inventario_producto.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductosAgroservicio } from 'src/productos_agroservicio/entities/productos_agroservicio.entity';

@Injectable()
export class InventarioProductosService {
  constructor(
    @InjectRepository(InventarioProducto)
    private readonly inventarioRepository: Repository<InventarioProducto>,

    @InjectRepository(ProductosAgroservicio)
    private readonly productoRepository: Repository<ProductosAgroservicio>,
  ) {}

  async create(createInventarioDto: CreateInventarioProductoDto) {
    const producto = await this.productoRepository.findOneBy({
      id: createInventarioDto.productoId,
    });
    if (!producto)
      throw new NotFoundException(
        `producto con ID ${createInventarioDto.productoId} no encontrado`,
      );

    const producto_exist_inventario = await this.inventarioRepository.findOne({
      where: { producto: producto },
    });
    if (producto_exist_inventario)
      throw new BadRequestException(
        'Este producto ya tiene un inventario establecido',
      );

    const inventario = this.inventarioRepository.create({
      producto,
      cantidadDisponible: createInventarioDto.cantidadDisponible,
      stockMinimo: createInventarioDto.stockMinimo,
    });

    return this.inventarioRepository.save(inventario);
  }

  async findAll(): Promise<InventarioProducto[]> {
    return this.inventarioRepository.find({ relations: ['producto'] });
  }

  async findproductosDisponibles() {
    try {
      const productos_disponibles = await this.inventarioRepository.find({
        where: { producto: { disponible: true } },
      });
      if (!productos_disponibles || productos_disponibles.length === 0) {
        throw new NotFoundException(
          'No se encontraron productos disponibles en este momento',
        );
      }
      return { productos: productos_disponibles };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const inventario = await this.inventarioRepository.findOne({
      where: { id },
      relations: ['producto'],
    });
    if (!inventario)
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    return inventario;
  }

  async reducirCantidad(
    productoId: string,
    cantidad: number,
  ): Promise<InventarioProducto> {
    if (cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad a reducir debe ser mayor a cero',
      );
    }

    const inventario = await this.inventarioRepository.findOne({
      where: { producto: { id: productoId } },
      relations: ['producto'],
    });

    if (!inventario) {
      throw new NotFoundException(
        `No se encontró inventario para el producto con ID ${productoId}`,
      );
    }

    if (inventario.cantidadDisponible < cantidad) {
      throw new BadRequestException(
        `No hay suficiente stock. Disponible: ${inventario.cantidadDisponible}, Solicitado: ${cantidad}`,
      );
    }

    inventario.cantidadDisponible -= cantidad;

    if (inventario.cantidadDisponible < inventario.stockMinimo) {
      console.warn(
        `¡Atención! producto ${inventario.producto.nombre} por debajo del stock mínimo`,
      );
    }

    return this.inventarioRepository.save(inventario);
  }

  async aumentarCantidad(
    productoId: string,
    cantidadUsada: number,
  ): Promise<InventarioProducto> {
    if (cantidadUsada <= 0) {
      throw new BadRequestException(
        'La cantidad a aumentar debe ser mayor a cero',
      );
    }

    const inventario = await this.inventarioRepository.findOne({
      where: { producto: { id: productoId } },
      relations: ['producto'],
    });

    if (!inventario) {
      throw new NotFoundException(
        `No se encontró inventario para el producto con ID ${productoId}`,
      );
    }

    inventario.cantidadDisponible += cantidadUsada;

    return this.inventarioRepository.save(inventario);
  }

  async update(id: string, updateInventarioDto: UpdateInventarioProductoDto) {
    const inventario = await this.findOne(id);

    if (updateInventarioDto.productoId) {
      const producto = await this.productoRepository.findOneBy({
        id: updateInventarioDto.productoId,
      });
      if (!producto)
        throw new NotFoundException(
          `producto con ID ${updateInventarioDto.productoId} no encontrado`,
        );
      inventario.producto = producto;
    }

    if (updateInventarioDto.cantidadDisponible !== undefined) {
      inventario.cantidadDisponible = updateInventarioDto.cantidadDisponible;
    }
    if (updateInventarioDto.stockMinimo !== undefined) {
      inventario.stockMinimo = updateInventarioDto.stockMinimo;
    }

    return this.inventarioRepository.save(inventario);
  }

  async remove(id: string): Promise<void> {
    const inventario = await this.findOne(id);
    await this.inventarioRepository.remove(inventario);
  }
}
