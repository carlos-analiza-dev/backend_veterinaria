import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEmpleadosAgroDto } from './dto/create-empleados-agro.dto';
import { UpdateEmpleadosAgroDto } from './dto/update-empleados-agro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmpleadosAgro } from './entities/empleados-agro.entity';
import { Repository } from 'typeorm';
import { AgroSucursale } from 'src/agro-sucursales/entities/agro-sucursale.entity';
import { RolesAgro } from 'src/roles-agro/entities/roles-agro.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import * as bcrypt from 'bcrypt';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { ValidationService } from 'src/validations/validation-uniques.service';

@Injectable()
export class EmpleadosAgroService {
  constructor(
    @InjectRepository(EmpleadosAgro)
    private readonly empleadoRepo: Repository<EmpleadosAgro>,
    @InjectRepository(AgroSucursale)
    private readonly sucursalRepo: Repository<AgroSucursale>,
    @InjectRepository(RolesAgro)
    private readonly rolesRepo: Repository<RolesAgro>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    @InjectRepository(DepartamentosPai)
    private readonly deptoRepo: Repository<DepartamentosPai>,
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepo: Repository<MunicipiosDepartamentosPai>,
    @InjectRepository(DatosAgroservicio)
    private readonly datosAgroRepo: Repository<DatosAgroservicio>,
    private readonly validationService: ValidationService,
  ) {}
  async create(createDto: CreateEmpleadosAgroDto, cliente: Cliente) {
    const {
      nombre,
      identificacion,
      telefono,
      email,
      password,
      direccion,
      sexo,
      roleId,
      paisId,
      departamentoId,
      municipioId,
      sucursalId,
    } = createDto;

    await Promise.all([
      this.validationService.validarEmail(email),
      this.validationService.validarIdentificacion(identificacion),
      this.validationService.validarTelefono(telefono),
    ]);
    const role = await this.rolesRepo.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new BadRequestException('No se encontró el rol seleccionado.');
    }

    const pais = await this.paisRepo.findOne({
      where: { id: paisId },
    });

    if (!pais) {
      throw new BadRequestException('No se encontró el país seleccionado.');
    }

    const departamento = await this.deptoRepo.findOne({
      where: { id: departamentoId },
    });

    if (!departamento) {
      throw new BadRequestException(
        'No se encontró el departamento seleccionado.',
      );
    }

    const municipio = await this.municipioRepo.findOne({
      where: { id: municipioId },
    });

    if (!municipio) {
      throw new BadRequestException(
        'No se encontró el municipio seleccionado.',
      );
    }

    const sucursal = await this.sucursalRepo.findOne({
      where: {
        id: sucursalId,
        isActive: true,
      },
    });

    if (!sucursal) {
      throw new BadRequestException('No se encontró la sucursal seleccionada.');
    }

    try {
      const empleado = this.empleadoRepo.create({
        nombre,
        identificacion,
        telefono,
        email,
        password: bcrypt.hashSync(password, 10),
        direccion,
        sexo,
        role,
        pais,
        departamento,
        municipio,
        sucursal,
        creado_por: cliente,
        isActive: true,
      });

      await this.empleadoRepo.save(empleado);

      delete empleado.password;

      return 'Empleado Creado con Exito';
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async findAll(
    cliente: Cliente,
    paginationDto: PaginationDto,
  ): Promise<{
    empleados: EmpleadosAgro[];
    total: number;
  }> {
    const propietarioId = getPropietarioId(cliente);
    const { limit = 10, offset = 0, rol } = paginationDto;

    const agroExiste = await this.datosAgroRepo.findOne({
      where: { propietarioId },
      select: ['id'],
    });

    if (!agroExiste) {
      throw new NotFoundException('No tiene un agroservicio registrado.');
    }

    const query = this.empleadoRepo
      .createQueryBuilder('empleado')
      .leftJoinAndSelect('empleado.role', 'rol')
      .leftJoinAndSelect('empleado.pais', 'pais')
      .leftJoinAndSelect('empleado.departamento', 'departamento')
      .leftJoinAndSelect('empleado.municipio', 'municipio')
      .leftJoinAndSelect('empleado.sucursal', 'sucursal')
      .leftJoin('sucursal.agroservicio', 'agroservicio')
      .where('agroservicio.id = :agroservicioId', {
        agroservicioId: agroExiste.id,
      })
      .orderBy('empleado.nombre', 'ASC')
      .skip(offset)
      .take(limit);

    if (rol) {
      query.andWhere('LOWER(rol.name) LIKE LOWER(:rol)', {
        rol: `%${rol}%`,
      });
    }

    const [empleados, total] = await query.getManyAndCount();

    return {
      empleados,
      total,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} empleadosAgro`;
  }

  async update(id: string, updateDto: UpdateEmpleadosAgroDto) {
    const empleado = await this.empleadoRepo.findOne({
      where: {
        id,
      },
    });

    if (!empleado) {
      throw new NotFoundException('No se encontró el empleado seleccionado.');
    }

    const {
      nombre,
      identificacion,
      telefono,
      email,
      password,
      direccion,
      sexo,
      roleId,
      paisId,
      departamentoId,
      municipioId,
      sucursalId,
      isActive,
    } = updateDto;

    if (email && email !== empleado.email) {
      await this.validationService.validarEmail(email);
      empleado.email = email;
    }

    if (identificacion && identificacion !== empleado.identificacion) {
      await this.validationService.validarIdentificacion(identificacion);
      empleado.identificacion = identificacion;
    }

    if (telefono && telefono !== empleado.telefono) {
      await this.validationService.validarTelefono(telefono);
      empleado.telefono = telefono;
    }

    if (roleId) {
      const role = await this.rolesRepo.findOne({
        where: { id: roleId },
      });

      if (!role) {
        throw new BadRequestException('No se encontró el rol seleccionado.');
      }

      empleado.role = role;
    }

    if (paisId) {
      const pais = await this.paisRepo.findOne({
        where: { id: paisId },
      });

      if (!pais) {
        throw new BadRequestException('No se encontró el país seleccionado.');
      }

      empleado.pais = pais;
    }

    if (departamentoId) {
      const departamento = await this.deptoRepo.findOne({
        where: { id: departamentoId },
      });

      if (!departamento) {
        throw new BadRequestException(
          'No se encontró el departamento seleccionado.',
        );
      }

      empleado.departamento = departamento;
    }

    if (municipioId) {
      const municipio = await this.municipioRepo.findOne({
        where: { id: municipioId },
      });

      if (!municipio) {
        throw new BadRequestException(
          'No se encontró el municipio seleccionado.',
        );
      }

      empleado.municipio = municipio;
    }

    if (sucursalId) {
      const sucursal = await this.sucursalRepo.findOne({
        where: {
          id: sucursalId,
          isActive: true,
        },
      });

      if (!sucursal) {
        throw new BadRequestException(
          'No se encontró la sucursal seleccionada.',
        );
      }

      empleado.sucursal = sucursal;
    }

    if (password) {
      empleado.password = bcrypt.hashSync(password, 10);
    }

    if (nombre) empleado.nombre = nombre;
    if (direccion !== undefined) empleado.direccion = direccion;
    if (sexo) empleado.sexo = sexo;
    if (isActive !== undefined) empleado.isActive = isActive;

    try {
      await this.empleadoRepo.save(empleado);

      delete empleado.password;

      return 'Empleado actualizado con éxito.';
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} empleadosAgro`;
  }

  private handleDatabaseErrors(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof UnauthorizedException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    if (error.code === '23505') {
      const detail = error.detail.toLowerCase();

      if (detail.includes('email')) {
        throw new BadRequestException(
          'El correo electrónico ya está registrado',
        );
      }
      if (detail.includes('identificacion')) {
        throw new BadRequestException('La identificación ya está registrada');
      }
      if (detail.includes('telefono')) {
        throw new BadRequestException(
          'El número de teléfono ya está registrado',
        );
      }

      throw new BadRequestException('Registro duplicado: ' + error.detail);
    }

    if (error.code === '22P02') {
      throw new BadRequestException('ID inválido proporcionado');
    }

    if (error.code === '23503') {
      throw new BadRequestException('Referencia a registro inexistente');
    }

    if (error instanceof Error) {
      if (
        error.name === 'NotFoundException' ||
        error.name === 'BadRequestException' ||
        error.name === 'UnauthorizedException'
      ) {
        throw error;
      }

      throw new BadRequestException(error.message);
    }

    throw new BadRequestException('Error desconocido en la base de datos');
  }
}
