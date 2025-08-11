import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductosAgroservicioDto } from './dto/create-productos_agroservicio.dto';
import { UpdateProductosAgroservicioDto } from './dto/update-productos_agroservicio.dto';
import { ProductosAgroservicio } from './entities/productos_agroservicio.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductosAgroservicioService {
  constructor(
    @InjectRepository(ProductosAgroservicio)
    private readonly productoRepository: Repository<ProductosAgroservicio>,
  ) {}

  async create(createProductosAgroservicioDto: CreateProductosAgroservicioDto) {
    const producto = this.productoRepository.create(
      createProductosAgroservicioDto,
    );
    return await this.productoRepository.save(producto);
  }

  async findAll() {
    return await this.productoRepository.find();
  }

  async findproductosDisponibles() {
    try {
      const productos_disponibles = await this.productoRepository.find({
        where: { disponible: true },
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
    const producto = await this.productoRepository.findOneBy({ id });
    if (!producto)
      throw new NotFoundException(`producto con ID ${id} no encontrado`);
    return producto;
  }

  async update(id: string, updateproductoDto: UpdateProductosAgroservicioDto) {
    const producto = await this.findOne(id);
    const actualizado = this.productoRepository.merge(
      producto,
      updateproductoDto,
    );
    return await this.productoRepository.save(actualizado);
  }

  async remove(id: string): Promise<void> {
    const producto = await this.findOne(id);
    await this.productoRepository.remove(producto);
  }
}
