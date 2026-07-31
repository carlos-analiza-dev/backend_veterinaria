import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgroClienteDto } from './dto/create-agro_cliente.dto';
import { UpdateAgroClienteDto } from './dto/update-agro_cliente.dto';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Pai } from 'src/pais/entities/pai.entity';
import { Brackets, Repository } from 'typeorm';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { AgroCliente } from './entities/agro_cliente.entity';
import { EmpleadosAgro } from 'src/empleados-agro/entities/empleados-agro.entity';
import {
  AccionEmpleado,
  AuditoriaEmpleados,
} from 'src/empleados-agro/entities/auditoria_empleados.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class AgroClientesService {
  constructor(
    @InjectRepository(AgroCliente)
    private readonly clienteRepository: Repository<AgroCliente>,
    @InjectRepository(Pai) private readonly paisRepo: Repository<Pai>,
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepo: Repository<MunicipiosDepartamentosPai>,
    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepo: Repository<DepartamentosPai>,
    @InjectRepository(AuditoriaEmpleados)
    private readonly auditEmpleadoRepo: Repository<AuditoriaEmpleados>,
    private readonly validationAgroservicio: AgroservicioValidationService,
  ) {}

  async create(cliente: Cliente, createAgroClienteDto: CreateAgroClienteDto) {
    const propietarioId = cliente.id ?? '';
    const paisId = cliente.pais.id ?? '';

    const {
      nombre,
      identificacion,
      telefono,
      email,
      direccion,
      sexo,
      departamentoId,
      municipioId,
    } = createAgroClienteDto;

    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const pais = await this.paisRepo.findOne({
      where: { id: paisId },
    });

    if (!pais) {
      throw new NotFoundException('El país no fue encontrado.');
    }

    const departamento = await this.departamentoRepo.findOne({
      where: {
        id: departamentoId,
        pais: { id: paisId },
      },
    });

    if (!departamento) {
      throw new NotFoundException('El departamento no fue encontrado.');
    }

    const municipio = await this.municipioRepo.findOne({
      where: {
        id: municipioId,
        departamento: { id: departamentoId },
      },
    });

    if (!municipio) {
      throw new NotFoundException(
        'El municipio no pertenece al departamento seleccionado.',
      );
    }

    const existeIdentificacion = await this.clienteRepository.findOne({
      where: {
        identificacion,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (existeIdentificacion) {
      throw new BadRequestException(
        'Ya existe un cliente con esa identificación.',
      );
    }

    const existeTelefono = await this.clienteRepository.findOne({
      where: {
        telefono,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (existeTelefono) {
      throw new BadRequestException('Ya existe un cliente con ese teléfono.');
    }

    if (email) {
      const existeEmail = await this.clienteRepository.findOne({
        where: {
          email,
          agroservicio: { id: agroservicio.id },
        },
      });

      if (existeEmail) {
        throw new BadRequestException(
          'Ya existe un cliente con ese correo electrónico.',
        );
      }
    }

    const nuevoCliente = this.clienteRepository.create({
      nombre,
      identificacion,
      telefono,
      email,
      direccion,
      sexo,
      pais,
      departamento,
      municipio,
      agroservicio,
    });

    await this.clienteRepository.save(nuevoCliente);

    return 'Cliente creado exitosamente.';
  }

  async createEmpleado(
    empleado: EmpleadosAgro,
    createAgroClienteDto: CreateAgroClienteDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const paisId = empleado.pais.id ?? '';

    const {
      nombre,
      identificacion,
      telefono,
      email,
      direccion,
      sexo,
      departamentoId,
      municipioId,
    } = createAgroClienteDto;

    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const pais = await this.paisRepo.findOne({
      where: { id: paisId },
    });

    if (!pais) {
      throw new NotFoundException('El país no fue encontrado.');
    }

    const departamento = await this.departamentoRepo.findOne({
      where: {
        id: departamentoId,
        pais: { id: paisId },
      },
    });

    if (!departamento) {
      throw new NotFoundException('El departamento no fue encontrado.');
    }

    const municipio = await this.municipioRepo.findOne({
      where: {
        id: municipioId,
        departamento: { id: departamentoId },
      },
    });

    if (!municipio) {
      throw new NotFoundException(
        'El municipio no pertenece al departamento seleccionado.',
      );
    }

    const existeIdentificacion = await this.clienteRepository.findOne({
      where: {
        identificacion,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (existeIdentificacion) {
      throw new BadRequestException(
        'Ya existe un cliente con esa identificación.',
      );
    }

    const existeTelefono = await this.clienteRepository.findOne({
      where: {
        telefono,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (existeTelefono) {
      throw new BadRequestException('Ya existe un cliente con ese teléfono.');
    }

    if (email) {
      const existeEmail = await this.clienteRepository.findOne({
        where: {
          email,
          agroservicio: { id: agroservicio.id },
        },
      });

      if (existeEmail) {
        throw new BadRequestException(
          'Ya existe un cliente con ese correo electrónico.',
        );
      }
    }

    const nuevoCliente = this.clienteRepository.create({
      nombre,
      identificacion,
      telefono,
      email,
      direccion,
      sexo,
      pais,
      departamento,
      municipio,
      agroservicio,
    });

    const cliente_creado = await this.clienteRepository.save(nuevoCliente);

    await this.auditEmpleadoRepo.save({
      empleadoId: empleado.id,
      accion: AccionEmpleado.CREAR_CLIENTE,
      descripcion: `El empleado ${empleado.nombre} ingreso un nuevo cliente: ${cliente_creado.nombre} al agroservicio`,
    });

    return 'Cliente creado exitosamente.';
  }

  async findAll(propietarioId: string, paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      departamento = '',
      municipio = '',
      search = '',
    } = paginationDto;

    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const query = this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.pais', 'pais')
      .leftJoinAndSelect('cliente.departamento', 'departamento')
      .leftJoinAndSelect('cliente.municipio', 'municipio')
      .where('cliente.agroservicioId = :agroservicioId', {
        agroservicioId: agroservicio.id,
      })
      .andWhere('cliente.isActive = true');

    if (departamento) {
      query.andWhere('departamento.id = :departamentoId', {
        departamentoId: departamento,
      });
    }

    if (municipio) {
      query.andWhere('municipio.id = :municipioId', {
        municipioId: municipio,
      });
    }

    if (search.trim()) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(cliente.nombre) LIKE LOWER(:search)', {
            search: `%${search}%`,
          }).orWhere('cliente.identificacion LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    query.orderBy('cliente.nombre', 'ASC').take(limit).skip(offset);

    const [clientes, total] = await query.getManyAndCount();

    return {
      total,
      limit,
      offset,
      clientes,
    };
  }

  async findAllActivos(propietarioId: string) {
    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const clientes = await this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.pais', 'pais')
      .leftJoinAndSelect('cliente.departamento', 'departamento')
      .leftJoinAndSelect('cliente.municipio', 'municipio')
      .where('cliente.agroservicioId = :agroservicioId', {
        agroservicioId: agroservicio.id,
      })
      .andWhere('cliente.isActive = :isActive', {
        isActive: true,
      })
      .orderBy('cliente.nombre', 'ASC')
      .getMany();

    return clientes;
  }

  findOne(id: number) {
    return `This action returns a #${id} agroCliente`;
  }

  async update(
    id: string,
    cliente: Cliente,
    updateAgroClienteDto: UpdateAgroClienteDto,
  ) {
    const propietarioId = cliente.id ?? '';
    const paisId = cliente.pais.id ?? '';

    const {
      nombre,
      identificacion,
      telefono,
      email,
      direccion,
      sexo,
      departamentoId,
      municipioId,
    } = updateAgroClienteDto;

    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const clienteEditar = await this.clienteRepository.findOne({
      where: {
        id,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (!clienteEditar) {
      throw new NotFoundException('El cliente no fue encontrado.');
    }

    const pais = await this.paisRepo.findOne({
      where: { id: paisId },
    });

    if (!pais) {
      throw new NotFoundException('El país no fue encontrado.');
    }

    const departamento = await this.departamentoRepo.findOne({
      where: {
        id: departamentoId,
        pais: { id: paisId },
      },
    });

    if (!departamento) {
      throw new NotFoundException('El departamento no fue encontrado.');
    }

    const municipio = await this.municipioRepo.findOne({
      where: {
        id: municipioId,
        departamento: { id: departamentoId },
      },
    });

    if (!municipio) {
      throw new NotFoundException(
        'El municipio no pertenece al departamento seleccionado.',
      );
    }

    const existeIdentificacion = await this.clienteRepository.findOne({
      where: {
        identificacion,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (existeIdentificacion && existeIdentificacion.id !== id) {
      throw new BadRequestException(
        'Ya existe un cliente con esa identificación.',
      );
    }

    const existeTelefono = await this.clienteRepository.findOne({
      where: {
        telefono,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (existeTelefono && existeTelefono.id !== id) {
      throw new BadRequestException('Ya existe un cliente con ese teléfono.');
    }

    if (email) {
      const existeEmail = await this.clienteRepository.findOne({
        where: {
          email,
          agroservicio: { id: agroservicio.id },
        },
      });

      if (existeEmail && existeEmail.id !== id) {
        throw new BadRequestException(
          'Ya existe un cliente con ese correo electrónico.',
        );
      }
    }

    clienteEditar.nombre = nombre;
    clienteEditar.identificacion = identificacion;
    clienteEditar.telefono = telefono;
    clienteEditar.email = email;
    clienteEditar.direccion = direccion;
    clienteEditar.sexo = sexo;
    clienteEditar.pais = pais;
    clienteEditar.departamento = departamento;
    clienteEditar.municipio = municipio;

    await this.clienteRepository.save(clienteEditar);

    return 'Cliente actualizado exitosamente.';
  }

  async updateEmpleado(
    id: string,
    empleado: EmpleadosAgro,
    updateAgroClienteDto: UpdateAgroClienteDto,
  ) {
    const propietarioId = empleado.creadoPorId ?? '';
    const paisId = empleado.pais.id ?? '';

    const {
      nombre,
      identificacion,
      telefono,
      email,
      direccion,
      sexo,
      departamentoId,
      municipioId,
    } = updateAgroClienteDto;

    const agroservicio =
      await this.validationAgroservicio.obtenerAgroservicio(propietarioId);

    const clienteEditar = await this.clienteRepository.findOne({
      where: {
        id,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (!clienteEditar) {
      throw new NotFoundException('El cliente no fue encontrado.');
    }

    const pais = await this.paisRepo.findOne({
      where: { id: paisId },
    });

    if (!pais) {
      throw new NotFoundException('El país no fue encontrado.');
    }

    const departamento = await this.departamentoRepo.findOne({
      where: {
        id: departamentoId,
        pais: { id: paisId },
      },
    });

    if (!departamento) {
      throw new NotFoundException('El departamento no fue encontrado.');
    }

    const municipio = await this.municipioRepo.findOne({
      where: {
        id: municipioId,
        departamento: { id: departamentoId },
      },
    });

    if (!municipio) {
      throw new NotFoundException(
        'El municipio no pertenece al departamento seleccionado.',
      );
    }

    const existeIdentificacion = await this.clienteRepository.findOne({
      where: {
        identificacion,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (existeIdentificacion && existeIdentificacion.id !== id) {
      throw new BadRequestException(
        'Ya existe un cliente con esa identificación.',
      );
    }

    const existeTelefono = await this.clienteRepository.findOne({
      where: {
        telefono,
        agroservicio: { id: agroservicio.id },
      },
    });

    if (existeTelefono && existeTelefono.id !== id) {
      throw new BadRequestException('Ya existe un cliente con ese teléfono.');
    }

    if (email) {
      const existeEmail = await this.clienteRepository.findOne({
        where: {
          email,
          agroservicio: { id: agroservicio.id },
        },
      });

      if (existeEmail && existeEmail.id !== id) {
        throw new BadRequestException(
          'Ya existe un cliente con ese correo electrónico.',
        );
      }
    }

    clienteEditar.nombre = nombre;
    clienteEditar.identificacion = identificacion;
    clienteEditar.telefono = telefono;
    clienteEditar.email = email;
    clienteEditar.direccion = direccion;
    clienteEditar.sexo = sexo;
    clienteEditar.pais = pais;
    clienteEditar.departamento = departamento;
    clienteEditar.municipio = municipio;

    const clienteActualizado = await this.clienteRepository.save(clienteEditar);

    await this.auditEmpleadoRepo.save({
      empleadoId: empleado.id,
      accion: AccionEmpleado.ACTUALIZAR_CLIENTE,
      descripcion: `El empleado ${empleado.nombre} actualizó el cliente ${clienteActualizado.nombre} del agroservicio`,
    });

    return 'Cliente actualizado exitosamente.';
  }

  remove(id: number) {
    return `This action removes a #${id} agroCliente`;
  }
}
