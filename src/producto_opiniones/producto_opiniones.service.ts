import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoOpinioneDto } from './dto/create-producto_opinione.dto';
import { UpdateProductoOpinioneDto } from './dto/update-producto_opinione.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoOpinione } from './entities/producto_opinione.entity';
import { Repository } from 'typeorm';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { ProductoRatingResumen } from 'src/producto_rating_resumen/entities/producto_rating_resuman.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class ProductoOpinionesService {
  constructor(
    @InjectRepository(ProductoOpinione)
    private readonly opinionRepository: Repository<ProductoOpinione>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(SubServicio)
    private readonly productoRepository: Repository<SubServicio>,
    @InjectRepository(ProductoRatingResumen)
    private readonly productoResumenRatingRepository: Repository<ProductoRatingResumen>,
  ) {}
  async create(
    cliente: Cliente,
    createProductoOpinioneDto: CreateProductoOpinioneDto,
  ) {
    const { productoId, comentario, rating, titulo } =
      createProductoOpinioneDto;
    try {
      const producto_existe = await this.productoRepository.findOne({
        where: { id: productoId },
      });
      if (!producto_existe) {
        throw new NotFoundException('No se encontro el producto seleccionado');
      }

      const opinionExistente = await this.opinionRepository.findOne({
        where: {
          cliente: { id: cliente.id },
          producto: { id: productoId },
        },
      });

      if (opinionExistente) {
        throw new BadRequestException('Ya has opinado sobre este producto');
      }

      const opinion = this.opinionRepository.create({
        cliente,
        titulo,
        comentario,
        compra_verificada: true,
        producto: producto_existe,
        rating,
      });

      await this.opinionRepository.save(opinion);

      await this.actualizarResumenRating(producto_existe, rating);

      return 'Opinion Guardada con Exito';
    } catch (error) {
      throw error;
    }
  }

  private async actualizarResumenRating(producto: SubServicio, rating: number) {
    let resumen = await this.productoResumenRatingRepository.findOne({
      where: { producto: { id: producto.id } },
    });

    if (!resumen) {
      resumen = this.productoResumenRatingRepository.create({
        producto,
        promedio: 0,
        total_opiniones: 0,
        estrellas_1: 0,
        estrellas_2: 0,
        estrellas_3: 0,
        estrellas_4: 0,
        estrellas_5: 0,
      });
    }

    resumen.total_opiniones += 1;

    switch (rating) {
      case 1:
        resumen.estrellas_1 += 1;
        break;
      case 2:
        resumen.estrellas_2 += 1;
        break;
      case 3:
        resumen.estrellas_3 += 1;
        break;
      case 4:
        resumen.estrellas_4 += 1;
        break;
      case 5:
        resumen.estrellas_5 += 1;
        break;
    }

    const totalPuntos =
      resumen.estrellas_1 * 1 +
      resumen.estrellas_2 * 2 +
      resumen.estrellas_3 * 3 +
      resumen.estrellas_4 * 4 +
      resumen.estrellas_5 * 5;

    resumen.promedio =
      resumen.total_opiniones > 0
        ? Number((totalPuntos / resumen.total_opiniones).toFixed(1))
        : 0;

    await this.productoResumenRatingRepository.save(resumen);
  }

  async findByProducto(paginationDto: PaginationDto, productoId: string) {
    const { limit = 5, offset = 0 } = paginationDto;

    const [opiniones, total] = await this.opinionRepository
      .createQueryBuilder('opinion')
      .leftJoin('opinion.cliente', 'cliente')
      .leftJoinAndSelect('cliente.profileImages', 'profileImage')
      .select([
        'opinion.id',
        'opinion.rating',
        'opinion.titulo',
        'opinion.comentario',
        'opinion.createdAt',
        'cliente.id',
        'cliente.nombre',
        'profileImage.id',
        'profileImage.url',
        'profileImage.createdAt',
      ])
      .where('opinion.productoId = :productoId', { productoId })
      .orderBy('opinion.createdAt', 'DESC')
      .addOrderBy('profileImage.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const opinionesConImagen = opiniones.map((opinion) => {
      const cliente = opinion.cliente;
      let profileImage = null;
      if (cliente.profileImages && cliente.profileImages.length > 0) {
        profileImage = cliente.profileImages[0];
      }
      return {
        ...opinion,
        cliente: {
          ...cliente,
          profileImage,
        },
      };
    });

    return {
      total,
      limit,
      offset,
      opiniones: opinionesConImagen,
    };
  }

  async verificarOpinionExistente(
    cliente: Cliente,
    productoId: string,
  ): Promise<boolean> {
    const clienteId = cliente.id;
    const opinionExistente = await this.opinionRepository.findOne({
      where: {
        cliente: { id: clienteId },
        producto: { id: productoId },
      },
      relations: ['cliente', 'producto'],
    });

    return !!opinionExistente;
  }

  update(id: number, updateProductoOpinioneDto: UpdateProductoOpinioneDto) {
    return `This action updates a #${id} productoOpinione`;
  }
}
