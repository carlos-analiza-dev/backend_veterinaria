import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marca } from './entities/marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { User } from 'src/auth/entities/auth.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class MarcasService {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepo: Repository<Marca>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createMarcaDto: CreateMarcaDto, userId: string) {
    const { nombre, pais_origen } = createMarcaDto;

    try {
      // Verificar que el usuario existe
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar que el nombre no esté duplicado
      const existeMarca = await this.marcaRepo.findOneBy({
        nombre: nombre.toUpperCase(),
      });
      if (existeMarca) {
        throw new ConflictException(
          `Ya existe una marca con el nombre ${nombre}`,
        );
      }

      // Crear la marca
      const nuevaMarca = this.marcaRepo.create({
        nombre: nombre.toUpperCase(), // Guardar en mayúsculas para consistencia
        pais_origen,
        created_by: user,
        updated_by: user,
      });

      await this.marcaRepo.save(nuevaMarca);

      return {
        message: 'Marca creada exitosamente',
        marca: instanceToPlain(nuevaMarca),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    // Extraer parámetros adicionales
    const search = (paginationDto as any).search || '';
    const isActive =
      (paginationDto as any).isActive !== undefined
        ? (paginationDto as any).isActive
        : true;

    try {
      const query = this.marcaRepo
        .createQueryBuilder('marca')
        .leftJoinAndSelect('marca.created_by', 'created_by')
        .leftJoinAndSelect('marca.updated_by', 'updated_by')
        .where('marca.is_active = :isActive', { isActive });

      // Búsqueda por nombre o país
      if (search && search.trim() !== '') {
        query.andWhere(
          '(LOWER(marca.nombre) LIKE :search OR ' +
            'LOWER(marca.pais_origen) LIKE :search)',
          { search: `%${search.toLowerCase()}%` },
        );
      }

      const total = await query.getCount();

      const marcas = await query
        .orderBy('marca.nombre', 'ASC')
        .skip(offset)
        .take(limit)
        .getMany();

      if (!marcas || marcas.length === 0) {
        throw new BadRequestException(
          'No se encontraron marcas en este momento',
        );
      }

      return instanceToPlain({
        data: marcas,
        total,
        limit,
        offset,
      });
    } catch (error) {
      throw error;
    }
  }

  async findAllActive() {
    try {
      const marcas = await this.marcaRepo.find({
        where: { is_active: true },
        select: ['id', 'nombre', 'pais_origen'],
        order: { nombre: 'ASC' },
      });

      return marcas;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const marca = await this.marcaRepo.findOne({
        where: { id },
        relations: ['created_by', 'updated_by'],
      });

      if (!marca) {
        throw new NotFoundException('Marca no encontrada');
      }

      return instanceToPlain(marca);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateMarcaDto: UpdateMarcaDto, userId: string) {
    const { nombre, pais_origen, is_active } = updateMarcaDto;

    try {
      // Verificar que la marca existe
      const marca = await this.marcaRepo.findOne({
        where: { id },
      });

      if (!marca) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }

      // Verificar que el usuario existe
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Si se está actualizando el nombre, verificar que no esté duplicado
      if (nombre && nombre.toUpperCase() !== marca.nombre) {
        const existeMarca = await this.marcaRepo.findOneBy({
          nombre: nombre.toUpperCase(),
        });
        if (existeMarca) {
          throw new ConflictException(
            `Ya existe otra marca con el nombre ${nombre}`,
          );
        }
      }

      // Actualizar campos
      if (nombre !== undefined) marca.nombre = nombre.toUpperCase();
      if (pais_origen !== undefined) marca.pais_origen = pais_origen;
      if (is_active !== undefined) marca.is_active = is_active;

      // Actualizar el usuario que modifica
      marca.updated_by = user;

      await this.marcaRepo.save(marca);

      return {
        message: 'Marca actualizada correctamente',
        marca: instanceToPlain(marca),
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      const marca = await this.marcaRepo.findOne({
        where: { id },
      });

      if (!marca) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Soft delete
      marca.is_active = false;
      marca.updated_by = user;

      await this.marcaRepo.save(marca);

      return {
        message: 'Marca eliminada correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  async restore(id: string, userId: string) {
    try {
      const marca = await this.marcaRepo.findOne({
        where: { id },
      });

      if (!marca) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Restaurar
      marca.is_active = true;
      marca.updated_by = user;

      await this.marcaRepo.save(marca);

      return {
        message: 'Marca restaurada correctamente',
      };
    } catch (error) {
      throw error;
    }
  }
}
