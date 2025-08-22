import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { User } from 'src/auth/entities/auth.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoria_repo: Repository<Categoria>,
    @InjectRepository(User)
    private readonly user_repo: Repository<User>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto, userId: string) {
    const { nombre, descripcion } = createCategoriaDto;

    try {
      const user = await this.user_repo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const existeCategoria = await this.categoria_repo.findOneBy({
        nombre: nombre.toUpperCase(),
      });
      if (existeCategoria) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre ${nombre}`,
        );
      }

      const nuevaCategoria = this.categoria_repo.create({
        nombre: nombre.toUpperCase(),
        descripcion,
        created_by: user,
        updated_by: user,
      });

      await this.categoria_repo.save(nuevaCategoria);

      return {
        message: 'Categoría creada exitosamente',
        data: instanceToPlain(nuevaCategoria),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const categorias = await this.categoria_repo.find({
        where: { is_active: true },
        order: { nombre: 'ASC' },
      });

      return instanceToPlain(categorias);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const categoria = await this.categoria_repo.findOneBy({ id });
      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }
      return instanceToPlain(categoria);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateCategoriaDto: UpdateCategoriaDto,
    userId: string,
  ) {
    try {
      const categoria = await this.categoria_repo.findOneBy({ id });
      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }

      const user = await this.user_repo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (updateCategoriaDto.nombre) {
        const existeNombre = await this.categoria_repo.findOneBy({
          nombre: updateCategoriaDto.nombre.toUpperCase(),
        });
        if (existeNombre && existeNombre.id !== id) {
          throw new ConflictException(
            `Ya existe otra categoría con el nombre ${updateCategoriaDto.nombre}`,
          );
        }
      }

      Object.assign(categoria, {
        ...updateCategoriaDto,
        nombre: updateCategoriaDto.nombre?.toUpperCase() || categoria.nombre,
        updated_by: user,
      });

      await this.categoria_repo.save(categoria);

      return {
        message: 'Categoría actualizada exitosamente',
        data: instanceToPlain(categoria),
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      const categoria = await this.categoria_repo.findOneBy({ id });
      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }

      const user = await this.user_repo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      categoria.is_active = false;
      categoria.updated_by = user;

      await this.categoria_repo.save(categoria);

      return {
        message: 'Categoría eliminada exitosamente',
      };
    } catch (error) {
      throw error;
    }
  }
}
