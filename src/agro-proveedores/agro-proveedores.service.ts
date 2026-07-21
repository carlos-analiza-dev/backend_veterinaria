import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgroProveedoreDto } from './dto/create-agro-proveedore.dto';
import { UpdateAgroProveedoreDto } from './dto/update-agro-proveedore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AgroProveedore } from './entities/agro-proveedore.entity';
import { Repository } from 'typeorm';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { instanceToPlain } from 'class-transformer';
import {
  AccionProveedor,
  AuditoriaProveedor,
} from './entities/auditoria_proveedores.entity';
import { SearchProveedorDto } from 'src/proveedores/dto/search-proveedor.dto';
import { Pai } from 'src/pais/entities/pai.entity';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';

@Injectable()
export class AgroProveedoresService {
  constructor(
    @InjectRepository(AgroProveedore)
    private readonly agroProRepo: Repository<AgroProveedore>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    @InjectRepository(DepartamentosPai)
    private readonly deptoRepo: Repository<DepartamentosPai>,
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioaRepo: Repository<MunicipiosDepartamentosPai>,
    @InjectRepository(AuditoriaProveedor)
    private readonly auditProveedor: Repository<AuditoriaProveedor>,
    @InjectRepository(DatosAgroservicio)
    private readonly agroServicio: Repository<DatosAgroservicio>,
    private readonly validationAgroService: AgroservicioValidationService,
  ) {}

  async create(createProveedorDto: CreateAgroProveedoreDto, cliente: Cliente) {
    const paisId = cliente.pais.id ?? '';
    const propietarioId = cliente.id ?? '';
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
      plazo,
      tipo_escala,
      tipo_pago_default,
    } = createProveedorDto;

    try {
      const agroservicio =
        await this.validationAgroService.obtenerAgroservicio(propietarioId);

      const existeNitRtn = await this.agroProRepo.findOneBy({
        nit_rtn,
        agroservicio: { id: agroservicio.id },
      });
      if (existeNitRtn) {
        throw new ConflictException(
          `Ya existe un proveedor con el NIT/RTN ${nit_rtn}`,
        );
      }

      let departamento = null;
      if (departamentoId) {
        departamento = await this.deptoRepo.findOneBy({
          id: departamentoId,
        });
        if (!departamento) {
          throw new NotFoundException('Departamento no encontrado');
        }
      }

      let municipio = null;
      if (municipioId) {
        municipio = await this.municipioaRepo.findOne({
          where: { id: municipioId },
          relations: ['departamento'],
        });
        if (!municipio) {
          throw new NotFoundException('Municipio no encontrado');
        }

        if (departamentoId && municipio.departamento?.id !== departamentoId) {
          throw new BadRequestException(
            'El municipio no pertenece al departamento seleccionado',
          );
        }
      }

      const nuevoProveedor = this.agroProRepo.create({
        nit_rtn,
        nrc,
        nombre_legal,
        complemento_direccion,
        telefono,
        correo,
        nombre_contacto,
        pais: { id: paisId },
        departamento,
        municipio,
        plazo,
        tipo_escala,
        tipo_pago_default,
        agroservicio,
      });

      await this.agroProRepo.save(nuevoProveedor);

      return {
        message: 'Proveedor creado exitosamente',
        proveedor: instanceToPlain(nuevoProveedor),
      };
    } catch (error) {
      throw error;
    }
  }

  async createAgroEmpleado(
    createProveedorDto: CreateAgroProveedoreDto,
    empleado: EmpleadosAgro,
  ) {
    const paisId = empleado.pais.id ?? '';
    const propietarioId = empleado.creadoPorId ?? '';
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
      plazo,
      tipo_escala,
      tipo_pago_default,
    } = createProveedorDto;

    try {
      const agroservicio =
        await this.validationAgroService.obtenerAgroservicio(propietarioId);

      const existeNitRtn = await this.agroProRepo.findOneBy({
        nit_rtn,
        agroservicio: { id: agroservicio.id },
      });
      if (existeNitRtn) {
        throw new ConflictException(
          `Ya existe un proveedor con el NIT/RTN ${nit_rtn}`,
        );
      }

      let departamento = null;
      if (departamentoId) {
        departamento = await this.deptoRepo.findOneBy({
          id: departamentoId,
        });
        if (!departamento) {
          throw new NotFoundException('Departamento no encontrado');
        }
      }

      let municipio = null;
      if (municipioId) {
        municipio = await this.municipioaRepo.findOne({
          where: { id: municipioId },
          relations: ['departamento'],
        });
        if (!municipio) {
          throw new NotFoundException('Municipio no encontrado');
        }

        if (departamentoId && municipio.departamento?.id !== departamentoId) {
          throw new BadRequestException(
            'El municipio no pertenece al departamento seleccionado',
          );
        }
      }

      const nuevoProveedor = this.agroProRepo.create({
        nit_rtn,
        nrc,
        nombre_legal,
        complemento_direccion,
        telefono,
        correo,
        nombre_contacto,
        pais: { id: paisId },
        departamento,
        municipio,
        plazo,
        tipo_escala,
        tipo_pago_default,
        agroservicio,
      });

      const proveedor_creado = await this.agroProRepo.save(nuevoProveedor);

      await this.auditProveedor.save({
        proveedorId: proveedor_creado.id,
        empleadoId: empleado.id,
        accion: AccionProveedor.CREAR,
      });

      return {
        message: 'Proveedor creado exitosamente',
        proveedor: instanceToPlain(nuevoProveedor),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(propietarioId: string, searchProveedorDto: SearchProveedorDto) {
    const {
      limit = 10,
      offset = 0,
      search,
      isActive,
      paisId,
    } = searchProveedorDto;

    const agroservicio = await this.agroServicio.findOne({
      where: { propietarioId },
    });
    if (!agroservicio)
      throw new NotFoundException(
        'No se encontro un agroservicio asociado para ingresar el proveedor',
      );

    try {
      const query = this.agroProRepo
        .createQueryBuilder('proveedor')
        .leftJoinAndSelect('proveedor.agroservicio', 'agroservicio')
        .leftJoinAndSelect('proveedor.pais', 'pais')
        .leftJoinAndSelect('proveedor.departamento', 'departamento')
        .leftJoinAndSelect('proveedor.municipio', 'municipio')
        .where('proveedor.agroservicioId = :agroservicioId', {
          agroservicioId: agroservicio.id,
        });

      let whereConditions: string[] = [];
      const parameters: {
        paisId?: string;
        isActive?: boolean;
        search?: string;
      } = {};

      if (paisId) {
        const pais = await this.paisRepo.findOneBy({ id: paisId });
        if (!pais) {
          throw new NotFoundException('País no encontrado');
        }
        whereConditions.push('proveedor.pais.id = :paisId');
        parameters.paisId = paisId;
      }

      if (isActive !== undefined) {
        whereConditions.push('proveedor.is_active = :isActive');
        parameters.isActive = isActive;
      }

      if (search && search.trim() !== '') {
        whereConditions.push(
          '(LOWER(proveedor.nombre_legal) LIKE LOWER(:search) OR ' +
            'LOWER(proveedor.nit_rtn) LIKE LOWER(:search) OR ' +
            'LOWER(proveedor.nombre_contacto) LIKE LOWER(:search))',
        );
        parameters.search = `%${search}%`;
      }

      if (whereConditions.length > 0) {
        query.where(whereConditions.join(' AND '), parameters);
      }

      const total = await query.getCount();

      const proveedores = await query
        .orderBy('proveedor.created_at', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      return {
        proveedores: instanceToPlain(proveedores),
        total,
        limit,
        offset,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllActive(propietarioId: string) {
    const agroservicio = await this.agroServicio.findOne({
      where: { propietarioId },
    });
    if (!agroservicio)
      throw new NotFoundException(
        'No se encontro un agroservicio asociado para ingresar el proveedor',
      );
    try {
      const proveedores = await this.agroProRepo.find({
        where: { is_active: true, agroservicio: { id: agroservicio.id } },

        order: { nombre_legal: 'ASC' },
      });

      return proveedores;
    } catch (error) {
      throw error;
    }
  }

  async findByPais(paisId: string, searchProveedorDto: SearchProveedorDto) {
    const { limit = 10, offset = 0, search, isActive } = searchProveedorDto;

    try {
      const pais = await this.paisRepo.findOneBy({ id: paisId });
      if (!pais) {
        throw new NotFoundException('País no encontrado');
      }

      const query = this.agroProRepo
        .createQueryBuilder('proveedor')
        .leftJoinAndSelect('proveedor.pais', 'pais')
        .leftJoinAndSelect('proveedor.departamento', 'departamento')
        .leftJoinAndSelect('proveedor.municipio', 'municipio')
        .where('proveedor.pais.id = :paisId', { paisId });

      if (isActive !== undefined) {
        query.andWhere('proveedor.is_active = :isActive', { isActive });
      }

      if (search && search.trim() !== '') {
        query.andWhere(
          '(LOWER(proveedor.nombre_legal) LIKE LOWER(:search) OR ' +
            'LOWER(proveedor.nit_rtn) LIKE LOWER(:search) OR ' +
            'LOWER(proveedor.nombre_contacto) LIKE LOWER(:search))',
          { search: `%${search}%` },
        );
      }

      const total = await query.getCount();

      const proveedores = await query
        .orderBy('proveedor.created_at', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      return {
        proveedores: instanceToPlain(proveedores),
        total,
        limit,
        offset,
        pais: instanceToPlain(pais),
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const proveedor = await this.agroProRepo.findOne({
        where: { id },
        relations: ['pais', 'departamento', 'municipio'],
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
    updateProveedorDto: UpdateAgroProveedoreDto,
    cliente: Cliente,
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
      plazo,
      tipo_escala,
      tipo_pago_default,
    } = updateProveedorDto;

    try {
      const agroservicio = await this.agroServicio.findOne({
        where: { propietarioId: cliente.id },
      });
      if (!agroservicio)
        throw new NotFoundException(
          'No se encontro un agroservicio asociado para ingresar el proveedor',
        );

      const proveedor = await this.agroProRepo.findOne({
        where: { id },
        relations: ['pais', 'departamento', 'municipio'],
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }

      if (nit_rtn && nit_rtn !== proveedor.nit_rtn) {
        const existeNitRtn = await this.agroProRepo.findOneBy({
          nit_rtn,
          agroservicio: { id: agroservicio.id },
        });
        if (existeNitRtn) {
          throw new ConflictException(
            `Ya existe un proveedor con el NIT/RTN ${nit_rtn}`,
          );
        }
      }

      if (departamentoId !== undefined) {
        if (departamentoId === null) {
          proveedor.departamento = null;
        } else {
          const departamento = await this.deptoRepo.findOneBy({
            id: departamentoId,
          });
          if (!departamento) {
            throw new NotFoundException('Departamento no encontrado');
          }
          proveedor.departamento = departamento;
        }
      }

      if (municipioId !== undefined) {
        if (municipioId === null) {
          proveedor.municipio = null;
        } else {
          const municipio = await this.municipioaRepo.findOne({
            where: { id: municipioId },
            relations: ['departamento'],
          });
          if (!municipio) {
            throw new NotFoundException('Municipio no encontrado');
          }

          if (departamentoId && municipio.departamento?.id !== departamentoId) {
            throw new BadRequestException(
              'El municipio no pertenece al departamento seleccionado',
            );
          }
          proveedor.municipio = municipio;
        }
      }

      if (nit_rtn !== undefined) proveedor.nit_rtn = nit_rtn;
      if (nrc !== undefined) proveedor.nrc = nrc;
      if (nombre_legal !== undefined) proveedor.nombre_legal = nombre_legal;
      if (complemento_direccion !== undefined)
        proveedor.complemento_direccion = complemento_direccion;
      if (telefono !== undefined) proveedor.telefono = telefono;
      if (correo !== undefined) proveedor.correo = correo;
      if (nombre_contacto !== undefined)
        proveedor.nombre_contacto = nombre_contacto;
      if (plazo !== undefined) proveedor.plazo = plazo;
      if (tipo_escala !== undefined) proveedor.tipo_escala = tipo_escala;
      if (tipo_pago_default !== undefined)
        proveedor.tipo_pago_default = tipo_pago_default;
      if (is_active !== undefined) proveedor.is_active = is_active;

      await this.agroProRepo.save(proveedor);

      return {
        message: 'Proveedor actualizado correctamente',
        proveedor: instanceToPlain(proveedor),
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmpleado(
    id: string,
    updateProveedorDto: UpdateAgroProveedoreDto,
    empleado: EmpleadosAgro,
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
      plazo,
      tipo_escala,
      tipo_pago_default,
    } = updateProveedorDto;

    try {
      const agroservicio = await this.agroServicio.findOne({
        where: { propietarioId: empleado.creadoPorId },
      });
      if (!agroservicio)
        throw new NotFoundException(
          'No se encontro un agroservicio asociado para ingresar el proveedor',
        );

      const proveedor = await this.agroProRepo.findOne({
        where: { id },
        relations: ['pais', 'departamento', 'municipio'],
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }

      if (nit_rtn && nit_rtn !== proveedor.nit_rtn) {
        const existeNitRtn = await this.agroProRepo.findOneBy({
          nit_rtn,
          agroservicio: { id: agroservicio.id },
        });
        if (existeNitRtn) {
          throw new ConflictException(
            `Ya existe un proveedor con el NIT/RTN ${nit_rtn}`,
          );
        }
      }

      if (departamentoId !== undefined) {
        if (departamentoId === null) {
          proveedor.departamento = null;
        } else {
          const departamento = await this.deptoRepo.findOneBy({
            id: departamentoId,
          });
          if (!departamento) {
            throw new NotFoundException('Departamento no encontrado');
          }
          proveedor.departamento = departamento;
        }
      }

      if (municipioId !== undefined) {
        if (municipioId === null) {
          proveedor.municipio = null;
        } else {
          const municipio = await this.municipioaRepo.findOne({
            where: { id: municipioId },
            relations: ['departamento'],
          });
          if (!municipio) {
            throw new NotFoundException('Municipio no encontrado');
          }

          if (departamentoId && municipio.departamento?.id !== departamentoId) {
            throw new BadRequestException(
              'El municipio no pertenece al departamento seleccionado',
            );
          }
          proveedor.municipio = municipio;
        }
      }

      if (nit_rtn !== undefined) proveedor.nit_rtn = nit_rtn;
      if (nrc !== undefined) proveedor.nrc = nrc;
      if (nombre_legal !== undefined) proveedor.nombre_legal = nombre_legal;
      if (complemento_direccion !== undefined)
        proveedor.complemento_direccion = complemento_direccion;
      if (telefono !== undefined) proveedor.telefono = telefono;
      if (correo !== undefined) proveedor.correo = correo;
      if (nombre_contacto !== undefined)
        proveedor.nombre_contacto = nombre_contacto;
      if (plazo !== undefined) proveedor.plazo = plazo;
      if (tipo_escala !== undefined) proveedor.tipo_escala = tipo_escala;
      if (tipo_pago_default !== undefined)
        proveedor.tipo_pago_default = tipo_pago_default;
      if (is_active !== undefined) proveedor.is_active = is_active;

      const proveedor_actualizado = await this.agroProRepo.save(proveedor);

      await this.auditProveedor.save({
        proveedorId: proveedor_actualizado.id,
        empleadoId: empleado.id,
        accion: AccionProveedor.ACTUALIZAR,
      });

      return {
        message: 'Proveedor actualizado correctamente',
        proveedor: instanceToPlain(proveedor),
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} agroProveedore`;
  }
}
