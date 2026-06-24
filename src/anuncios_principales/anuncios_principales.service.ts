import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnunciosPrincipaleDto } from './dto/create-anuncios_principale.dto';
import { UpdateAnunciosPrincipaleDto } from './dto/update-anuncios_principale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AnunciosPrincipale,
  EtiquetaAnuncio,
} from './entities/anuncios_principale.entity';
import { Repository } from 'typeorm';

import { ImagesAnunciosService } from 'src/images_anuncios/images_anuncios.service';
import { User } from 'src/auth/entities/auth.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class AnunciosPrincipalesService {
  constructor(
    @InjectRepository(AnunciosPrincipale)
    private readonly anunciosRepo: Repository<AnunciosPrincipale>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    private anunciosImagesService: ImagesAnunciosService,
  ) {}

  async create(
    createAnunciosPrincipaleDto: CreateAnunciosPrincipaleDto,
    imagenes: Express.Multer.File[],
    user: User,
  ) {
    const paisId = user.pais.id ?? '';
    const pais_existe = await this.paisRepo.findOne({ where: { id: paisId } });
    if (!pais_existe) {
      throw new NotFoundException('No existe el pais seleccionado');
    }

    if (
      createAnunciosPrincipaleDto.fechaInicio &&
      createAnunciosPrincipaleDto.fechaFin &&
      new Date(createAnunciosPrincipaleDto.fechaFin) <
        new Date(createAnunciosPrincipaleDto.fechaInicio)
    ) {
      throw new BadRequestException(
        'La fecha de fin debe ser mayor a la fecha de inicio',
      );
    }

    const anuncio = this.anunciosRepo.create({
      titulo: createAnunciosPrincipaleDto.titulo,
      descripcion: createAnunciosPrincipaleDto.descripcion,
      link: createAnunciosPrincipaleDto.link,
      pais: pais_existe,
      etiqueta:
        createAnunciosPrincipaleDto.etiqueta || EtiquetaAnuncio.PATROCINADO,
      esPrincipal: createAnunciosPrincipaleDto.esPrincipal || false,
      fechaInicio: createAnunciosPrincipaleDto.fechaInicio
        ? new Date(createAnunciosPrincipaleDto.fechaInicio)
        : null,
      fechaFin: createAnunciosPrincipaleDto.fechaFin
        ? new Date(createAnunciosPrincipaleDto.fechaFin)
        : null,
    });

    const savedAnuncio = await this.anunciosRepo.save(anuncio);

    if (imagenes && imagenes.length > 0) {
      for (const imagen of imagenes) {
        await this.anunciosImagesService.uploadAnuncioImage(
          savedAnuncio.id,
          imagen,
        );
      }
    }

    return 'Anuncio ingresado exitosamente';
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const paisId = user.pais.id;

    const { limit = 10, offset = 0, principal, mostrar } = paginationDto;

    const queryBuilder = this.anunciosRepo
      .createQueryBuilder('anuncio')
      .leftJoinAndSelect('anuncio.pais', 'pais')
      .leftJoinAndSelect('anuncio.anucioImages', 'imagenes')
      .where('pais.id = :paisId', { paisId });

    if (principal !== undefined) {
      queryBuilder.andWhere('anuncio.esPrincipal = :principal', {
        principal,
      });
    }

    if (mostrar !== undefined) {
      queryBuilder.andWhere('anuncio.mostrar = :mostrar', {
        mostrar,
      });
    }

    queryBuilder
      .orderBy('anuncio.fecha_registro', 'DESC')
      .skip(offset)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      anuncios: data,
      total,
      limit,
      offset,
    };
  }

  async findAllAnuncios(cliente: Cliente, paginationDto: PaginationDto) {
    const paisId = cliente.pais.id;
    const { principal, mostrar } = paginationDto;

    const hoy = new Date();

    const queryBuilder = this.anunciosRepo
      .createQueryBuilder('anuncio')
      .leftJoinAndSelect('anuncio.pais', 'pais')
      .leftJoinAndSelect('anuncio.anucioImages', 'imagenes')
      .where('pais.id = :paisId', { paisId })
      .andWhere('anuncio.fechaInicio IS NOT NULL')
      .andWhere('anuncio.fechaFin IS NOT NULL')
      .andWhere('anuncio.fechaInicio <= :hoy', { hoy })
      .andWhere('anuncio.fechaFin >= :hoy', { hoy });

    if (principal !== undefined) {
      queryBuilder.andWhere('anuncio.esPrincipal = :principal', {
        principal,
      });
    }

    if (mostrar !== undefined) {
      queryBuilder.andWhere('anuncio.mostrar = :mostrar', {
        mostrar,
      });
    }

    return queryBuilder.orderBy('anuncio.fecha_registro', 'DESC').getMany();
  }

  async findOne(id: string): Promise<AnunciosPrincipale> {
    const anuncio = await this.anunciosRepo.findOne({
      where: { id },
    });

    if (!anuncio) {
      throw new NotFoundException(`Anuncio con ID ${id} no encontrado`);
    }

    return anuncio;
  }

  async update(
    id: string,
    updateAnunciosPrincipaleDto: UpdateAnunciosPrincipaleDto,
    imagenes?: Express.Multer.File[],
    imagenesAEliminar?: string[],
  ) {
    const anuncio = await this.findOne(id);

    const fechaInicio = updateAnunciosPrincipaleDto.fechaInicio
      ? new Date(updateAnunciosPrincipaleDto.fechaInicio)
      : anuncio.fechaInicio;

    const fechaFin = updateAnunciosPrincipaleDto.fechaFin
      ? new Date(updateAnunciosPrincipaleDto.fechaFin)
      : anuncio.fechaFin;

    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser mayor o igual a la fecha de inicio',
      );
    }

    if (updateAnunciosPrincipaleDto.titulo) {
      anuncio.titulo = updateAnunciosPrincipaleDto.titulo;
    }

    if (updateAnunciosPrincipaleDto.descripcion) {
      anuncio.descripcion = updateAnunciosPrincipaleDto.descripcion;
    }

    if (updateAnunciosPrincipaleDto.link) {
      anuncio.link = updateAnunciosPrincipaleDto.link;
    }

    if (updateAnunciosPrincipaleDto.etiqueta) {
      anuncio.etiqueta = updateAnunciosPrincipaleDto.etiqueta;
    }

    if (updateAnunciosPrincipaleDto.esPrincipal !== undefined) {
      anuncio.esPrincipal = updateAnunciosPrincipaleDto.esPrincipal;
    }

    if (updateAnunciosPrincipaleDto.mostrar !== undefined) {
      anuncio.mostrar = updateAnunciosPrincipaleDto.mostrar;
    }

    if (updateAnunciosPrincipaleDto.fechaInicio) {
      anuncio.fechaInicio = fechaInicio;
    }

    if (updateAnunciosPrincipaleDto.fechaFin) {
      anuncio.fechaFin = fechaFin;
    }

    if (imagenesAEliminar && imagenesAEliminar.length > 0) {
      for (const imageUrl of imagenesAEliminar) {
        await this.anunciosImagesService.deleteImageById(imageUrl);
      }
    }

    const updatedAnuncio = await this.anunciosRepo.save(anuncio);

    if (imagenes && imagenes.length > 0) {
      for (const imagen of imagenes) {
        await this.anunciosImagesService.uploadAnuncioImage(
          updatedAnuncio.id,
          imagen,
        );
      }
    }

    return 'Anuncio actualizado con exito';
  }

  remove(id: number) {
    return `This action removes a #${id} anunciosPrincipale`;
  }
}
