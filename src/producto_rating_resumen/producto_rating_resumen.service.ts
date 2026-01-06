import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoRatingResumanDto } from './dto/create-producto_rating_resuman.dto';
import { UpdateProductoRatingResumanDto } from './dto/update-producto_rating_resuman.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoRatingResumen } from './entities/producto_rating_resuman.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductoRatingResumenService {
  constructor(
    @InjectRepository(ProductoRatingResumen)
    private readonly ratingRepo: Repository<ProductoRatingResumen>,
  ) {}
  create(createProductoRatingResumanDto: CreateProductoRatingResumanDto) {
    return 'This action adds a new productoRatingResuman';
  }

  findAll() {
    return `This action returns all productoRatingResumen`;
  }

  async findByProductoId(productoId: string) {
    const rating = await this.ratingRepo.findOne({
      where: {
        producto: { id: productoId },
      },
      relations: ['producto'],
    });

    if (!rating) {
      throw new NotFoundException(
        `No se encontraron calificaciones para el producto`,
      );
    }

    return rating;
  }

  findOne(id: number) {
    return `This action returns a #${id} productoRatingResuman`;
  }

  update(
    id: number,
    updateProductoRatingResumanDto: UpdateProductoRatingResumanDto,
  ) {
    return `This action updates a #${id} productoRatingResuman`;
  }

  remove(id: number) {
    return `This action removes a #${id} productoRatingResuman`;
  }
}
