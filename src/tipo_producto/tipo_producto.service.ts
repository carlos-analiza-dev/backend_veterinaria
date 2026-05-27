import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTipoProductoDto } from './dto/create-tipo_producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo_producto.dto';
import { User } from 'src/auth/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoProducto } from './entities/tipo_producto.entity';
import { Repository } from 'typeorm';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class TipoProductoService {
  constructor(
    @InjectRepository(TipoProducto)
    private readonly tipoRepository: Repository<TipoProducto>,
    @InjectRepository(Subcategoria)
    private readonly subCategoriaRepo: Repository<Subcategoria>,
  ) {}
  async create(createTipoProductoDto: CreateTipoProductoDto, user: User) {
    const { subcategoriaId, is_market } = createTipoProductoDto;
    try {
      const subcategoria = await this.subCategoriaRepo.findOne({
        where: { id: subcategoriaId },
      });
      if (!subcategoria)
        throw new NotFoundException(
          'No se encontro la subcategoria seleccionada',
        );

      const tipo = await this.tipoRepository.create({
        ...createTipoProductoDto,
        sub_categoria: subcategoria,
        created_by: user,
        is_market,
      });

      await this.tipoRepository.save(tipo);
      return 'El tipo de producto fue guardado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, is_market } = paginationDto;

    const queryBuilder = this.tipoRepository
      .createQueryBuilder('tipo')
      .leftJoinAndSelect('tipo.sub_categoria', 'subcategoria')
      .leftJoinAndSelect('subcategoria.categoria', 'categoria')
      .take(limit)
      .skip(offset);

    if (is_market !== undefined) {
      queryBuilder.andWhere('tipo.is_market = :is_market', {
        is_market,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      tipos: data,
      total,
      limit,
      offset,
    };
  }

  async findAllBySubCategoria(id: string) {
    try {
      const subcategoria_existe = await this.subCategoriaRepo.findOne({
        where: { id },
      });
      if (!subcategoria_existe)
        throw new NotFoundException('No se encontro la subcategoria');
      const tipos_producto = await this.tipoRepository.find({
        where: { sub_categoria: { id }, is_market: false },
        relations: ['sub_categoria'],
      });
      if (!tipos_producto)
        throw new NotFoundException(
          'No se encontraron tipos pertenecientes a esta sub categoria',
        );
      return tipos_producto;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const tipo = await this.tipoRepository.findOne({
      where: { id },
      relations: ['sub_categoria', 'sub_categoria.categoria'],
    });

    if (!tipo) {
      throw new NotFoundException(`El tipo de producto con ID ${id} no existe`);
    }

    return tipo;
  }

  async update(
    id: string,
    updateTipoProductoDto: UpdateTipoProductoDto,
    user: User,
  ) {
    const tipo = await this.findOne(id);

    if (updateTipoProductoDto.subcategoriaId) {
      const subcategoria = await this.subCategoriaRepo.findOne({
        where: { id: updateTipoProductoDto.subcategoriaId },
      });

      if (!subcategoria) {
        throw new NotFoundException(
          'No se encontró la subcategoría seleccionada',
        );
      }

      tipo.sub_categoria = subcategoria;
      delete updateTipoProductoDto.subcategoriaId;
    }

    tipo.updated_by = user;

    Object.assign(tipo, updateTipoProductoDto);

    try {
      await this.tipoRepository.save(tipo);
      return 'El tipo de producto fue actualizado exitosamente';
    } catch (error) {
      throw error;
    }
  }
}
