import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategoria } from './entities/subcategoria.entity';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { User } from 'src/auth/entities/auth.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class SubcategoriasService {
  constructor(
    @InjectRepository(Subcategoria)
    private readonly subcategoria_repo: Repository<Subcategoria>,
    @InjectRepository(User)
    private readonly user_repo: Repository<User>,
    @InjectRepository(Categoria)
    private readonly categoria_repo: Repository<Categoria>,
  ) {}

  async create(createSubcategoriaDto: CreateSubcategoriaDto, userId: string) {
    const { nombre, descripcion, codigo, categoriaId } = createSubcategoriaDto;

    try {
      const user = await this.user_repo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const categoria = await this.categoria_repo.findOneBy({
        id: categoriaId,
      });
      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }

      if (!categoria.is_active) {
        throw new BadRequestException(
          'La categoría seleccionada no está activa',
        );
      }

      const existeSubcategoria = await this.subcategoria_repo
        .createQueryBuilder('subcategoria')
        .where('UPPER(subcategoria.nombre) = UPPER(:nombre)', { nombre })
        .andWhere('subcategoria.categoriaId = :categoriaId', { categoriaId })
        .getOne();

      if (existeSubcategoria) {
        throw new ConflictException(
          `Ya existe una subcategoría con el nombre ${nombre} en esta categoría`,
        );
      }

      if (codigo) {
        const existeCodigo = await this.subcategoria_repo.findOneBy({
          codigo: codigo.toUpperCase(),
        });
        if (existeCodigo) {
          throw new ConflictException(
            `Ya existe una subcategoría con el código ${codigo}`,
          );
        }
      }

      const codigoFinal = codigo
        ? codigo.toUpperCase()
        : await this.generarCodigo(categoria.nombre, nombre);

      const nuevaSubcategoria = this.subcategoria_repo.create({
        nombre: nombre.toUpperCase(),
        descripcion,
        codigo: codigoFinal,
        categoria,
        created_by: user,
        updated_by: user,
      });

      await this.subcategoria_repo.save(nuevaSubcategoria);

      return {
        message: 'Subcategoría creada exitosamente',
        data: instanceToPlain(nuevaSubcategoria),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(categoriaId?: string) {
    try {
      const query = this.subcategoria_repo
        .createQueryBuilder('subcategoria')
        .leftJoinAndSelect('subcategoria.categoria', 'categoria')
        .where('subcategoria.is_active = :isActive', { isActive: true })
        .orderBy('subcategoria.nombre', 'ASC');

      if (categoriaId) {
        query.andWhere('subcategoria.categoriaId = :categoriaId', {
          categoriaId,
        });
      }

      const subcategorias = await query.getMany();
      return instanceToPlain(subcategorias);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const subcategoria = await this.subcategoria_repo
        .createQueryBuilder('subcategoria')
        .leftJoinAndSelect('subcategoria.categoria', 'categoria')
        .where('subcategoria.id = :id', { id })
        .getOne();

      if (!subcategoria) {
        throw new NotFoundException('Subcategoría no encontrada');
      }

      return instanceToPlain(subcategoria);
    } catch (error) {
      throw error;
    }
  }

  async findByCategoria(categoriaId: string) {
    try {
      const categoria = await this.categoria_repo.findOneBy({
        id: categoriaId,
      });
      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }

      const subcategorias = await this.subcategoria_repo.find({
        where: {
          categoria: { id: categoriaId },
          is_active: true,
        },
        relations: ['categoria'],
        order: { nombre: 'ASC' },
      });

      return instanceToPlain(subcategorias);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateSubcategoriaDto: UpdateSubcategoriaDto,
    userId: string,
  ) {
    try {
      const subcategoria = await this.subcategoria_repo.findOne({
        where: { id },
        relations: ['categoria'],
      });

      if (!subcategoria) {
        throw new NotFoundException('Subcategoría no encontrada');
      }

      const user = await this.user_repo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (
        updateSubcategoriaDto.categoriaId &&
        updateSubcategoriaDto.categoriaId !== subcategoria.categoria.id
      ) {
        const nuevaCategoria = await this.categoria_repo.findOneBy({
          id: updateSubcategoriaDto.categoriaId,
        });
        if (!nuevaCategoria) {
          throw new NotFoundException('Nueva categoría no encontrada');
        }
        if (!nuevaCategoria.is_active) {
          throw new BadRequestException('La nueva categoría no está activa');
        }
        subcategoria.categoria = nuevaCategoria;
      }

      if (
        updateSubcategoriaDto.nombre &&
        updateSubcategoriaDto.nombre.toUpperCase() !== subcategoria.nombre
      ) {
        const existeNombre = await this.subcategoria_repo
          .createQueryBuilder('subcategoria')
          .where('UPPER(subcategoria.nombre) = UPPER(:nombre)', {
            nombre: updateSubcategoriaDto.nombre,
          })
          .andWhere('subcategoria.categoriaId = :categoriaId', {
            categoriaId: subcategoria.categoria.id,
          })
          .andWhere('subcategoria.id != :id', { id })
          .getOne();

        if (existeNombre) {
          throw new ConflictException(
            `Ya existe otra subcategoría con el nombre ${updateSubcategoriaDto.nombre} en esta categoría`,
          );
        }
      }

      if (
        updateSubcategoriaDto.codigo &&
        updateSubcategoriaDto.codigo.toUpperCase() !== subcategoria.codigo
      ) {
        const existeCodigo = await this.subcategoria_repo.findOneBy({
          codigo: updateSubcategoriaDto.codigo.toUpperCase(),
        });
        if (existeCodigo && existeCodigo.id !== id) {
          throw new ConflictException(
            `Ya existe otra subcategoría con el código ${updateSubcategoriaDto.codigo}`,
          );
        }
      }

      Object.assign(subcategoria, {
        ...updateSubcategoriaDto,
        nombre:
          updateSubcategoriaDto.nombre?.toUpperCase() || subcategoria.nombre,
        codigo:
          updateSubcategoriaDto.codigo?.toUpperCase() || subcategoria.codigo,
        updated_by: user,
      });

      await this.subcategoria_repo.save(subcategoria);

      return {
        message: 'Subcategoría actualizada exitosamente',
        data: instanceToPlain(subcategoria),
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      const subcategoria = await this.subcategoria_repo.findOneBy({ id });
      if (!subcategoria) {
        throw new NotFoundException('Subcategoría no encontrada');
      }

      const user = await this.user_repo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      subcategoria.is_active = false;
      subcategoria.updated_by = user;

      await this.subcategoria_repo.save(subcategoria);

      return {
        message: 'Subcategoría eliminada exitosamente',
      };
    } catch (error) {
      throw error;
    }
  }

  private async generarCodigo(
    categoriaNombre: string,
    subcategoriaNombre: string,
  ): Promise<string> {
    const catPrefix = categoriaNombre.substring(0, 3).toUpperCase();
    const subPrefix = subcategoriaNombre.substring(0, 3).toUpperCase();

    let codigo = `${catPrefix}-${subPrefix}`;
    let contador = 1;

    while (true) {
      const existe = await this.subcategoria_repo.findOneBy({
        codigo: contador === 1 ? codigo : `${codigo}${contador}`,
      });

      if (!existe) {
        return contador === 1 ? codigo : `${codigo}${contador}`;
      }

      contador++;
    }
  }
}
