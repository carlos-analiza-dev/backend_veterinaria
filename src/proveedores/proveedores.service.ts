import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { User } from 'src/auth/entities/auth.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepo: Repository<DepartamentosPai>,
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepo: Repository<MunicipiosDepartamentosPai>,
  ) {}

  async create(createProveedorDto: CreateProveedorDto, userId: string) {
    const {
      nit_rtn,
      nrc,
      nombre_legal,
      complemento_direccion,
      telefono,
      correo,
      nombre_contacto,
      departamentoId,
      municipioId,
    } = createProveedorDto;

    try {
      // Verificar que el usuario existe
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar que el NIT/RTN no esté duplicado
      const existeNitRtn = await this.proveedorRepo.findOneBy({ nit_rtn });
      if (existeNitRtn) {
        throw new ConflictException(
          `Ya existe un proveedor con el NIT/RTN ${nit_rtn}`,
        );
      }

      // Verificar departamento si se proporciona
      let departamento = null;
      if (departamentoId) {
        departamento = await this.departamentoRepo.findOneBy({
          id: departamentoId,
        });
        if (!departamento) {
          throw new NotFoundException('Departamento no encontrado');
        }
      }

      // Verificar municipio si se proporciona
      let municipio = null;
      if (municipioId) {
        municipio = await this.municipioRepo.findOne({
          where: { id: municipioId },
          relations: ['departamento'],
        });
        if (!municipio) {
          throw new NotFoundException('Municipio no encontrado');
        }

        // Verificar que el municipio pertenezca al departamento seleccionado
        if (departamentoId && municipio.departamento?.id !== departamentoId) {
          throw new BadRequestException(
            'El municipio no pertenece al departamento seleccionado',
          );
        }
      }

      // Crear el proveedor
      const nuevoProveedor = this.proveedorRepo.create({
        nit_rtn,
        nrc,
        nombre_legal,
        complemento_direccion,
        telefono,
        correo,
        nombre_contacto,
        departamento,
        municipio,
        created_by: user,
        updated_by: user,
      });

      await this.proveedorRepo.save(nuevoProveedor);

      return {
        message: 'Proveedor creado exitosamente',
        proveedor: instanceToPlain(nuevoProveedor),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    // Extraer parámetros adicionales de forma segura
    const search = (paginationDto as any).search || '';
    const isActive =
      (paginationDto as any).isActive !== undefined
        ? (paginationDto as any).isActive
        : true;

    try {
      const query = this.proveedorRepo
        .createQueryBuilder('proveedor')
        .leftJoinAndSelect('proveedor.departamento', 'departamento')
        .leftJoinAndSelect('proveedor.municipio', 'municipio')
        .leftJoinAndSelect('proveedor.created_by', 'created_by')
        .leftJoinAndSelect('proveedor.updated_by', 'updated_by')
        .where('proveedor.is_active = :isActive', { isActive });

      // Búsqueda por nombre legal, NIT/RTN o nombre de contacto
      if (search && search.trim() !== '') {
        query.andWhere(
          '(LOWER(proveedor.nombre_legal) LIKE :search OR ' +
            'LOWER(proveedor.nit_rtn) LIKE :search OR ' +
            'LOWER(proveedor.nombre_contacto) LIKE :search)',
          { search: `%${search.toLowerCase()}%` },
        );
      }

      const total = await query.getCount();

      const proveedores = await query
        .orderBy('proveedor.created_at', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      if (!proveedores || proveedores.length === 0) {
        throw new BadRequestException(
          'No se encontraron proveedores en este momento',
        );
      }

      return instanceToPlain({
        data: proveedores,
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
      const proveedores = await this.proveedorRepo.find({
        where: { is_active: true },
        select: ['id', 'nombre_legal', 'nit_rtn'],
        order: { nombre_legal: 'ASC' },
      });

      return proveedores;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const proveedor = await this.proveedorRepo.findOne({
        where: { id },
        relations: ['departamento', 'municipio', 'created_by', 'updated_by'],
      });

      if (!proveedor) {
        throw new NotFoundException('Proveedor no encontrado');
      }

      return instanceToPlain(proveedor);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateProveedorDto: UpdateProveedorDto,
    userId: string,
  ) {
    const {
      nit_rtn,
      nrc,
      nombre_legal,
      complemento_direccion,
      telefono,
      correo,
      nombre_contacto,
      departamentoId,
      municipioId,
      is_active,
    } = updateProveedorDto;

    try {
      // Verificar que el proveedor existe
      const proveedor = await this.proveedorRepo.findOne({
        where: { id },
        relations: ['departamento', 'municipio'],
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }

      // Verificar que el usuario existe
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Si se está actualizando el NIT/RTN, verificar que no esté duplicado
      if (nit_rtn && nit_rtn !== proveedor.nit_rtn) {
        const existeNitRtn = await this.proveedorRepo.findOneBy({ nit_rtn });
        if (existeNitRtn) {
          throw new ConflictException(
            `Ya existe otro proveedor con el NIT/RTN ${nit_rtn}`,
          );
        }
      }

      // Verificar departamento si se proporciona
      if (departamentoId !== undefined) {
        if (departamentoId === null) {
          proveedor.departamento = null;
        } else {
          const departamento = await this.departamentoRepo.findOneBy({
            id: departamentoId,
          });
          if (!departamento) {
            throw new NotFoundException('Departamento no encontrado');
          }
          proveedor.departamento = departamento;
        }
      }

      // Verificar municipio si se proporciona
      if (municipioId !== undefined) {
        if (municipioId === null) {
          proveedor.municipio = null;
        } else {
          const municipio = await this.municipioRepo.findOne({
            where: { id: municipioId },
            relations: ['departamento'],
          });
          if (!municipio) {
            throw new NotFoundException('Municipio no encontrado');
          }

          // Verificar que el municipio pertenezca al departamento seleccionado
          if (departamentoId && municipio.departamento?.id !== departamentoId) {
            throw new BadRequestException(
              'El municipio no pertenece al departamento seleccionado',
            );
          }
          proveedor.municipio = municipio;
        }
      }

      // Actualizar campos
      if (nit_rtn !== undefined) proveedor.nit_rtn = nit_rtn;
      if (nrc !== undefined) proveedor.nrc = nrc;
      if (nombre_legal !== undefined) proveedor.nombre_legal = nombre_legal;
      if (complemento_direccion !== undefined)
        proveedor.complemento_direccion = complemento_direccion;
      if (telefono !== undefined) proveedor.telefono = telefono;
      if (correo !== undefined) proveedor.correo = correo;
      if (nombre_contacto !== undefined)
        proveedor.nombre_contacto = nombre_contacto;
      if (is_active !== undefined) proveedor.is_active = is_active;

      // Actualizar el usuario que modifica
      proveedor.updated_by = user;

      await this.proveedorRepo.save(proveedor);

      return {
        message: 'Proveedor actualizado correctamente',
        proveedor: instanceToPlain(proveedor),
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      const proveedor = await this.proveedorRepo.findOne({
        where: { id },
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Soft delete
      proveedor.is_active = false;
      proveedor.updated_by = user;

      await this.proveedorRepo.save(proveedor);

      return {
        message: 'Proveedor eliminado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  async restore(id: string, userId: string) {
    try {
      const proveedor = await this.proveedorRepo.findOne({
        where: { id },
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Restaurar
      proveedor.is_active = true;
      proveedor.updated_by = user;

      await this.proveedorRepo.save(proveedor);

      return {
        message: 'Proveedor restaurado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }
}
