import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
import { LoginEmpleadoDto } from './dto/login-empleado.dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { TipoPaquete } from 'src/interfaces/paquetes/paquetes.enum';
import { ClientePaquete } from 'src/cliente_paquetes/entities/cliente_paquete.entity';

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
    @InjectRepository(ClientePaquete)
    private readonly clientePaqueteRepo: Repository<ClientePaquete>,
    private readonly validationService: ValidationService,
    private readonly jwtService: JwtService,
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

  async login(loginDto: LoginEmpleadoDto) {
    const { email, password } = loginDto;

    try {
      const empleado = await this.empleadoRepo
        .createQueryBuilder('empleado')
        .leftJoinAndSelect('empleado.role', 'role')
        .leftJoinAndSelect('empleado.sucursal', 'sucursal')
        .leftJoinAndSelect('empleado.pais', 'pais')
        .leftJoinAndSelect('empleado.departamento', 'departamento')
        .leftJoinAndSelect('empleado.municipio', 'municipio')
        .select([
          'empleado.id',
          'empleado.nombre',
          'empleado.identificacion',
          'empleado.telefono',
          'empleado.email',
          'empleado.password',
          'empleado.direccion',
          'empleado.sexo',
          'empleado.isActive',

          'role.id',
          'role.name',
          'role.description',

          'sucursal.id',
          'sucursal.nombre',
          'sucursal.tipo',

          'pais.id',
          'pais.nombre',

          'departamento.id',
          'departamento.nombre',

          'municipio.id',
          'municipio.nombre',
        ])
        .where('empleado.email = :email', { email })
        .getOne();

      if (!empleado) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }

      const isValidPassword = bcrypt.compareSync(password, empleado.password);
      if (!isValidPassword) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }

      if (!empleado.isActive) {
        throw new UnauthorizedException(
          'El empleado se encuentra desactivado.',
        );
      }

      const sucursal = await this.sucursalRepo.findOne({
        where: { id: empleado.sucursal.id },
        relations: ['agroservicio', 'agroservicio.propietario'],
      });

      if (!sucursal) {
        throw new UnauthorizedException('La sucursal del empleado no existe.');
      }

      if (!sucursal.agroservicio) {
        throw new UnauthorizedException(
          'La sucursal no está asociada a un agroservicio.',
        );
      }

      const agroservicio = sucursal.agroservicio;

      if (!agroservicio.propietario) {
        throw new UnauthorizedException(
          'El agroservicio no tiene un propietario registrado.',
        );
      }

      const propietario = agroservicio.propietario;

      const paqueteActivo = await this.clientePaqueteRepo
        .createQueryBuilder('clientePaquete')
        .innerJoinAndSelect('clientePaquete.paquete', 'paquete')
        .where('clientePaquete.clienteId = :propietarioId', {
          propietarioId: propietario.id,
        })
        .andWhere('clientePaquete.activo = :activo', { activo: true })
        .andWhere('paquete.tipo = :tipo', { tipo: TipoPaquete.AGRO_GESTION })
        .andWhere('clientePaquete.fechaFin > :now', { now: new Date() })
        .getOne();

      if (!paqueteActivo) {
        throw new UnauthorizedException(
          'El agroservicio no tiene un plan AGRO_GESTION activo. Contacta al propietario para activarlo.',
        );
      }

      if (
        paqueteActivo.fechaFin &&
        new Date(paqueteActivo.fechaFin) < new Date()
      ) {
        throw new UnauthorizedException(
          'El plan AGRO_GESTION del agroservicio ha vencido. Contacta al propietario para renovarlo.',
        );
      }

      const token = this.jwtService.sign({
        id: empleado.id,
        email: empleado.email,
        rol: 'empleado',
        agroservicioId: agroservicio.id,
      });

      delete empleado.password;

      return {
        ...empleado,
        token,
        agroservicio: {
          id: agroservicio.id,
          nombre: agroservicio.nombre_agroservicio,
          rtn: agroservicio.rtn,
          correo: agroservicio.correo,
          telefono: agroservicio.telefono,
          direccion: agroservicio.direccion,
          propietario: {
            id: propietario.id,
            nombre: propietario.nombre,
            email: propietario.email,
            identificacion: propietario.identificacion,
            telefono: propietario.telefono,
          },
        },
        paquete: {
          id: paqueteActivo.id,
          nombre: paqueteActivo.paquete.nombre,
          tipo: paqueteActivo.paquete.tipo,
          fechaInicio: paqueteActivo.fechaInicio,
          fechaFin: paqueteActivo.fechaFin,
          diasRestantes: this.calcularDiasRestantes(paqueteActivo.fechaFin),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  private calcularDiasRestantes(fechaFin: Date): number {
    if (!fechaFin) return 0;
    const now = new Date();
    const diffTime = new Date(fechaFin).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  async checkAuthStatus(empleado: EmpleadosAgro) {
    delete empleado.password;
    return {
      ...empleado,
      token: this.getJwtToken({ id: empleado.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    if (!this.jwtService) {
      throw new InternalServerErrorException('JwtService no está disponible');
    }
    return this.jwtService.sign(payload);
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
