import { Injectable, NotFoundException } from '@nestjs/common';
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

    const anuncio = this.anunciosRepo.create({
      titulo: createAnunciosPrincipaleDto.titulo,
      descripcion: createAnunciosPrincipaleDto.descripcion,
      link: createAnunciosPrincipaleDto.link,
      pais: pais_existe,
      etiqueta:
        createAnunciosPrincipaleDto.etiqueta || EtiquetaAnuncio.PATROCINADO,
      esPrincipal: createAnunciosPrincipaleDto.esPrincipal || false,
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

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, principal, mostrar } = paginationDto;

    const queryBuilder = this.anunciosRepo
      .createQueryBuilder('anuncio')
      .leftJoinAndSelect('anuncio.pais', 'pais')
      .leftJoinAndSelect('anuncio.anucioImages', 'imagenes');

    if (principal !== undefined) {
      queryBuilder.andWhere('anuncio.esPrincipal = :principal', { principal });
    }

    if (mostrar !== undefined) {
      queryBuilder.andWhere('anuncio.mostrar = :mostrar', { mostrar });
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

  async findAllAnuncios() {}

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
  ): Promise<AnunciosPrincipale> {
    const anuncio = await this.findOne(id);

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

    return this.findOne(updatedAnuncio.id);
  }

  remove(id: number) {
    return `This action removes a #${id} anunciosPrincipale`;
  }
}
