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
import { SearchMarcaDto } from './dto/search-marca.dto';
import { instanceToPlain } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class MarcasService {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepo: Repository<Marca>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createMarcaDto: CreateMarcaDto, userId: string) {
    const { nombre, pais_origen, is_market } = createMarcaDto;

    try {
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const nombreMarca = nombre.trim().toUpperCase();

      const existeMarca = await this.marcaRepo.findOneBy({
        nombre: nombreMarca,
        is_market,
      });

      if (existeMarca) {
        throw new ConflictException(
          `Ya existe una marca con el nombre ${nombreMarca} para ${
            is_market ? 'Marketplace' : 'Agroservicio'
          }`,
        );
      }

      const nuevaMarca = this.marcaRepo.create({
        nombre: nombreMarca,
        pais_origen,
        is_market,
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

  async findAll(searchMarcaDto: SearchMarcaDto) {
    const {
      limit = 10,
      offset = 0,
      search,
      isActive,
      is_market,
    } = searchMarcaDto;

    try {
      const query = this.marcaRepo
        .createQueryBuilder('marca')
        .leftJoinAndSelect('marca.created_by', 'created_by')
        .leftJoinAndSelect('marca.updated_by', 'updated_by');

      let whereConditions: string[] = [];
      const parameters: {
        isActive?: boolean;
        is_market?: boolean;
        search?: string;
      } = {};

      if (isActive !== undefined) {
        whereConditions.push('marca.is_active = :isActive');
        parameters.isActive = isActive;
      }

      if (is_market !== undefined) {
        whereConditions.push('marca.is_market = :is_market');
        parameters.is_market = is_market;
      }

      if (search && search.trim() !== '') {
        whereConditions.push(
          '(LOWER(marca.nombre) LIKE LOWER(:search) OR ' +
            'LOWER(marca.pais_origen) LIKE LOWER(:search))',
        );
        parameters.search = `%${search}%`;
      }

      if (whereConditions.length > 0) {
        query.where(whereConditions.join(' AND '), parameters);
      }

      const total = await query.getCount();

      const marcas = await query
        .orderBy('marca.nombre', 'ASC')
        .skip(offset)
        .take(limit)
        .getMany();

      return {
        data: instanceToPlain(marcas),
        total,
        limit,
        offset,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllActive(paginationDto: PaginationDto) {
    const { is_market = false } = paginationDto;
    return await this.marcaRepo
      .createQueryBuilder('marca')
      .select(['marca.id', 'marca.nombre', 'marca.pais_origen'])
      .where('marca.is_active = :active', { active: true })
      .andWhere('marca.is_market = :market', { market: is_market })
      .orderBy('marca.nombre', 'ASC')
      .getMany();
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

      if (nombre !== undefined) {
        const nombreNormalizado = nombre.trim().toUpperCase();

        if (!nombreNormalizado) {
          throw new BadRequestException(
            'El nombre de la marca no puede estar vacío',
          );
        }

        const existeMarca = await this.marcaRepo
          .createQueryBuilder('marca')
          .where('marca.nombre = :nombre', {
            nombre: nombreNormalizado,
          })
          .andWhere('marca.is_market = :is_market', {
            is_market: marca.is_market,
          })
          .andWhere('marca.id != :id', {
            id,
          })
          .getOne();

        if (existeMarca) {
          throw new ConflictException(
            `Ya existe otra marca con el nombre ${nombreNormalizado} para ${
              marca.is_market ? 'Marketplace' : 'Agroservicio'
            }`,
          );
        }

        marca.nombre = nombreNormalizado;
      }

      if (pais_origen !== undefined) {
        marca.pais_origen = pais_origen;
      }

      if (is_active !== undefined) {
        marca.is_active = is_active;
      }

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
