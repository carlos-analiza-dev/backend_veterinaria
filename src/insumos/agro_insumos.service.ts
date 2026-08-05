import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgroInsumos } from './entities/agro_insumos.entity';
import { Repository } from 'typeorm';
import { AgroProveedore } from 'src/agro-proveedores/entities/agro-proveedore.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { CreateAgroInsumoDto } from './dto/create-agro-insumo.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { UpdateAgroInsumoDto } from './dto/update-insumo.dto';
import {
  AccionEmpleado,
  AuditoriaEmpleados,
} from 'src/empleados-agro/entities/auditoria_empleados.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';

@Injectable()
export class AgroInsumosService {
  constructor(
    @InjectRepository(AgroInsumos)
    private readonly insumoRepository: Repository<AgroInsumos>,
    @InjectRepository(AgroProveedore)
    private readonly repoProveedor: Repository<AgroProveedore>,
    @InjectRepository(Marca)
    private readonly repoMarca: Repository<Marca>,
    @InjectRepository(AuditoriaEmpleados)
    private readonly auditoriaEmpleados: Repository<AuditoriaEmpleados>,
    private readonly validationAgro: AgroservicioValidationService,
  ) {}

  async create(cliente: Cliente, createInsumoDto: CreateAgroInsumoDto) {
    const propietarioId = cliente.id ?? '';
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const { costo, nombre, unidad_venta, disponible, proveedorId, marcaId } =
      createInsumoDto;
    try {
      const marca_exist = await this.repoMarca.findOne({
        where: { id: marcaId },
      });
      if (!marca_exist)
        throw new NotFoundException('No se encontro la marca seleccionada');

      const proveedor_exist = await this.repoProveedor.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_exist)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const codigo = await this.generarCodigoInsumo(agroservicio.id);

      const insumo_exist_codigo = await this.insumoRepository.findOne({
        where: { codigo: codigo, agroservicio: { id: agroservicio.id } },
      });
      if (insumo_exist_codigo)
        throw new ConflictException('Ya existe un insumo con este codigo');

      const insumoExistNombre = await this.insumoRepository
        .createQueryBuilder('insumo')
        .where('insumo.agroservicioId = :agroservicioId', {
          agroservicioId: agroservicio.id,
        })
        .andWhere('LOWER(TRIM(insumo.nombre)) = LOWER(TRIM(:nombre))', {
          nombre,
        })
        .getOne();

      if (insumoExistNombre) {
        throw new ConflictException('Ya existe un insumo con este nombre');
      }

      const insumo = this.insumoRepository.create({
        codigo,
        costo,
        disponible,
        marca: marca_exist,
        proveedor: proveedor_exist,
        nombre,
        agroservicio: { id: agroservicio.id },
        unidad_venta,
      });
      await this.insumoRepository.save(insumo);

      return 'Insumo creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async createEmpleado(
    empleado: EmpleadosAgro,
    createInsumoDto: CreateAgroInsumoDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const { costo, nombre, unidad_venta, disponible, proveedorId, marcaId } =
      createInsumoDto;
    try {
      const marca_exist = await this.repoMarca.findOne({
        where: { id: marcaId },
      });
      if (!marca_exist)
        throw new NotFoundException('No se encontro la marca seleccionada');

      const proveedor_exist = await this.repoProveedor.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_exist)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const codigo = await this.generarCodigoInsumo(agroservicio.id);

      const insumo_exist_codigo = await this.insumoRepository.findOne({
        where: { codigo: codigo, agroservicio: { id: agroservicio.id } },
      });
      if (insumo_exist_codigo)
        throw new ConflictException('Ya existe un insumo con este codigo');

      const insumoExistNombre = await this.insumoRepository
        .createQueryBuilder('insumo')
        .where('insumo.agroservicioId = :agroservicioId', {
          agroservicioId: agroservicio.id,
        })
        .andWhere('LOWER(TRIM(insumo.nombre)) = LOWER(TRIM(:nombre))', {
          nombre,
        })
        .getOne();

      if (insumoExistNombre) {
        throw new ConflictException('Ya existe un insumo con este nombre');
      }

      const insumo = this.insumoRepository.create({
        codigo,
        costo,
        disponible,
        marca: marca_exist,
        proveedor: proveedor_exist,
        nombre,
        agroservicio: { id: agroservicio.id },
        unidad_venta,
      });
      const insumo_guardado = await this.insumoRepository.save(insumo);

      await this.auditoriaEmpleados.save({
        empleadoId: empleado.id,
        accion: AccionEmpleado.CREAR_INSUMO,
        descripcion: `El empleado ${empleado.nombre} ha ingresado un nuevo insumo ${insumo_guardado.nombre} con codigo ${insumo_guardado.codigo}`,
      });

      return 'Insumo creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;
    const {
      limit = 10,
      offset = 0,
      proveedor = '',
      marca = '',
    } = paginationDto;

    const queryBuilder = this.insumoRepository
      .createQueryBuilder('insumo')
      .leftJoinAndSelect('insumo.marca', 'marca')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .leftJoinAndSelect('insumo.agroservicio', 'agroservicio')
      .where('agroservicio.id = :agroservicioId', { agroservicioId })
      .orderBy('insumo.createdAt', 'DESC');

    if (proveedor && proveedor.trim() !== '') {
      queryBuilder.andWhere(
        '(proveedor.id = :proveedorId OR proveedor.nombre_legal ILIKE :proveedorNombre)',
        {
          proveedorId: proveedor,
          proveedorNombre: `%${proveedor}%`,
        },
      );
    }

    if (marca && marca.trim() !== '') {
      queryBuilder.andWhere(
        '(marca.id = :marcaId OR marca.nombre ILIKE :marcaNombre)',
        {
          marcaId: marca,
          marcaNombre: `%${marca}%`,
        },
      );
    }

    queryBuilder.skip(offset).take(limit);

    const [insumos, total] = await queryBuilder.getManyAndCount();

    return {
      insumos,
      total,
    };
  }
  async findInsumosDisponibles(propietarioId: string) {
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    try {
      const insumos_disponibles = await this.insumoRepository.find({
        where: {
          disponible: true,
          agroservicio: { id: agroservicioId },
        },
        relations: ['agroservicio'],
      });

      if (!insumos_disponibles || insumos_disponibles.length === 0) {
        throw new NotFoundException(
          'No se encontraron insumos disponibles en tu agroservicio en este momento',
        );
      }

      return { insumos: instanceToPlain(insumos_disponibles) };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const insumo = await this.insumoRepository.findOneBy({ id });
    if (!insumo)
      throw new NotFoundException(`insumo con ID ${id} no encontrado`);
    return insumo;
  }

  async update(
    id: string,
    cliente: Cliente,
    updateInsumoDto: UpdateAgroInsumoDto,
  ) {
    const propietarioId = cliente.id ?? '';
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    try {
      const insumo = await this.findOne(id);

      if (updateInsumoDto.costo !== undefined && updateInsumoDto.costo <= 0) {
        throw new BadRequestException('El costo debe ser mayor a 0');
      }

      if (updateInsumoDto.marcaId) {
        const marca = await this.repoMarca.findOne({
          where: { id: updateInsumoDto.marcaId, is_active: true },
        });
        if (!marca) {
          throw new NotFoundException('Marca no encontrada o inactiva');
        }
        insumo.marca = marca;
      }

      if (updateInsumoDto.proveedorId) {
        const proveedor = await this.repoProveedor.findOne({
          where: { id: updateInsumoDto.proveedorId, is_active: true },
        });
        if (!proveedor) {
          throw new NotFoundException('Proveedor no encontrado o inactivo');
        }
        insumo.proveedor = proveedor;
      }

      if (updateInsumoDto.nombre) {
        const insumoExistNombre = await this.insumoRepository
          .createQueryBuilder('insumo')
          .where('insumo.agroservicioId = :agroservicioId', {
            agroservicioId: agroservicio.id,
          })
          .andWhere('LOWER(TRIM(insumo.nombre)) = LOWER(TRIM(:nombre))', {
            nombre: updateInsumoDto.nombre,
          })
          .andWhere('insumo.id != :id', { id })
          .getOne();

        if (insumoExistNombre) {
          throw new ConflictException('Ya existe un insumo con este nombre');
        }
      }

      const camposActualizables = [
        'nombre',
        'unidad_venta',
        'descripcion',
        'costo',
        'disponible',
      ];

      camposActualizables.forEach((campo) => {
        if (updateInsumoDto[campo] !== undefined) {
          insumo[campo] = updateInsumoDto[campo];
        }
      });

      if (updateInsumoDto.unidad_venta) {
        insumo.unidad_venta = updateInsumoDto.unidad_venta;
      }

      const insumoActualizado = await this.insumoRepository.save(insumo);

      return {
        message: 'Insumo actualizado exitosamente',
        data: insumoActualizado,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmpleado(
    id: string,
    empleado: EmpleadosAgro,
    updateInsumoDto: UpdateAgroInsumoDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const agroservicio =
      await this.validationAgro.obtenerAgroservicio(propietarioId);
    try {
      const insumo = await this.findOne(id);

      if (updateInsumoDto.costo !== undefined && updateInsumoDto.costo <= 0) {
        throw new BadRequestException('El costo debe ser mayor a 0');
      }

      if (updateInsumoDto.marcaId) {
        const marca = await this.repoMarca.findOne({
          where: { id: updateInsumoDto.marcaId, is_active: true },
        });
        if (!marca) {
          throw new NotFoundException('Marca no encontrada o inactiva');
        }
        insumo.marca = marca;
      }

      if (updateInsumoDto.proveedorId) {
        const proveedor = await this.repoProveedor.findOne({
          where: { id: updateInsumoDto.proveedorId, is_active: true },
        });
        if (!proveedor) {
          throw new NotFoundException('Proveedor no encontrado o inactivo');
        }
        insumo.proveedor = proveedor;
      }

      if (updateInsumoDto.nombre) {
        const insumoExistNombre = await this.insumoRepository
          .createQueryBuilder('insumo')
          .where('insumo.agroservicioId = :agroservicioId', {
            agroservicioId: agroservicio.id,
          })
          .andWhere('LOWER(TRIM(insumo.nombre)) = LOWER(TRIM(:nombre))', {
            nombre: updateInsumoDto.nombre,
          })
          .andWhere('insumo.id != :id', { id })
          .getOne();

        if (insumoExistNombre) {
          throw new ConflictException('Ya existe un insumo con este nombre');
        }
      }

      const camposActualizables = [
        'nombre',
        'unidad_venta',
        'descripcion',
        'costo',
        'disponible',
      ];

      camposActualizables.forEach((campo) => {
        if (updateInsumoDto[campo] !== undefined) {
          insumo[campo] = updateInsumoDto[campo];
        }
      });

      if (updateInsumoDto.unidad_venta) {
        insumo.unidad_venta = updateInsumoDto.unidad_venta;
      }

      const insumoActualizado = await this.insumoRepository.save(insumo);

      await this.auditoriaEmpleados.save({
        empleadoId: empleado.id,
        accion: AccionEmpleado.ACTUALIZAR_INSUMO,
        descripcion: `El empleado ${empleado.nombre} ha actualizado el insumo ${insumoActualizado.nombre} con codigo ${insumoActualizado.codigo}`,
      });

      return {
        message: 'Insumo actualizado exitosamente',
        data: insumoActualizado,
      };
    } catch (error) {
      throw error;
    }
  }

  private async generarCodigoInsumo(agroservicioId: string): Promise<string> {
    const ultimo = await this.insumoRepository
      .createQueryBuilder('insumo')
      .where('insumo.agroservicioId = :agroservicioId', { agroservicioId })
      .andWhere('insumo.codigo LIKE :prefijo', { prefijo: 'INS-%' })
      .orderBy('insumo.codigo', 'DESC')
      .getOne();

    if (!ultimo) {
      return 'INS-000001';
    }

    const numero = Number(ultimo.codigo.substring(4));

    return `INS-${String(numero + 1).padStart(6, '0')}`;
  }
}
