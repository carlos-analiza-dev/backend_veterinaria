import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthClienteDto } from './dto/create-auth-cliente.dto';
import { UpdateAuthClienteDto } from './dto/update-auth-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Cliente } from './entities/auth-cliente.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { UpdatePasswordDto } from './dto/update-password-cliente.dto';
import { User } from 'src/auth/entities/auth.entity';
import { instanceToPlain } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { VerifiedAccountDto } from 'src/auth/dto/verify-account';
import { NotificacionesAdminsService } from 'src/notificaciones_admins/notificaciones_admins.service';
import { NotificationType } from 'src/interfaces/nptificaciones.type';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { formatearFecha, formatearFechaEs } from 'src/helpers/format-date';
import { ClientePaquete } from 'src/cliente_paquetes/entities/cliente_paquete.entity';
import { CreateAuthTrabajadorDto } from './dto/create-trabajador.dto';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { ClienteFincaTrabajador } from 'src/cliente_finca_trabajador/entities/cliente_finca_trabajador.entity';
import { UpdateAuthTrabajadotDto } from './dto/update-trabajdor.dto';

@Injectable()
export class AuthClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Pai) private readonly paisRepo: Repository<Pai>,
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepo: Repository<MunicipiosDepartamentosPai>,
    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepo: Repository<DepartamentosPai>,
    @InjectRepository(ClientePaquete)
    private readonly clientePaquete: Repository<ClientePaquete>,
    @InjectRepository(FincasGanadero)
    private readonly fincasRepository: Repository<FincasGanadero>,
    @InjectRepository(ClienteFincaTrabajador)
    private readonly clienteFincaTrabajadorRepository: Repository<ClienteFincaTrabajador>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly notificacionService: NotificacionesAdminsService,
  ) {}
  async create(createClienteDto: CreateAuthClienteDto) {
    const {
      email,
      nombre,
      password,
      direccion,
      identificacion,
      telefono,
      pais: paisId,
      departamento: departamentoId,
      municipio: municipioId,
      sexo,
    } = createClienteDto;

    const usuario_existe = await this.userRepository.findOne({
      where: { email },
    });
    if (usuario_existe)
      throw new NotFoundException(
        'Ya existe un usuario registrado con este correo electronico',
      );

    const cliente_existe = await this.clienteRepository.findOne({
      where: { email },
    });
    if (cliente_existe)
      throw new NotFoundException(
        'Ya existe un usuario registrado con este correo electronico',
      );

    const identificacion_existe = await this.userRepository.findOne({
      where: { identificacion },
    });
    if (identificacion_existe)
      throw new NotFoundException(
        'Ya existe un usuario registrado con esta identificacion',
      );

    const identificacion_existe_cliente = await this.clienteRepository.findOne({
      where: { identificacion },
    });
    if (identificacion_existe_cliente)
      throw new NotFoundException(
        'Ya existe un usuario registrado con esta identificacion',
      );

    const pais_existe = await this.paisRepo.findOne({ where: { id: paisId } });
    if (!pais_existe) {
      throw new BadRequestException('No se encontró el país seleccionado.');
    }

    const departamento_existe = await this.departamentoRepo.findOne({
      where: { id: departamentoId },
    });
    if (!departamento_existe) {
      throw new BadRequestException(
        'No se encontró el departamento seleccionado.',
      );
    }

    const municipio_existe = await this.municipioRepo.findOne({
      where: { id: municipioId },
    });
    if (!municipio_existe) {
      throw new BadRequestException(
        'No se encontró el municipio seleccionado.',
      );
    }

    if (
      createClienteDto.rol === TipoCliente.TRABAJADOR ||
      createClienteDto.rol === TipoCliente.SUPERVISOR
    ) {
      throw new BadRequestException(
        'Los trabajadores deben ser creados por un administrador',
      );
    }

    try {
      const user = this.clienteRepository.create({
        email,
        password: bcrypt.hashSync(password, 10),
        nombre,
        direccion,
        identificacion,
        telefono,
        pais: pais_existe,
        departamento: departamento_existe,
        municipio: municipio_existe,
        sexo,
        rol: createClienteDto.rol ?? TipoCliente.PROPIETARIO,
        isActive: true,
        verified: false,
      });

      await this.clienteRepository.save(user);
      delete user.password;

      const administradores = await this.userRepository.find({
        where: { role: { name: 'Administrador' } },
        relations: ['role'],
      });

      if (administradores && administradores.length > 0) {
        const year = new Date().getFullYear().toString();

        await Promise.all(
          administradores.map(async (admin) => {
            try {
              await this.mailService.verifyCreateClient(
                admin.email,
                user.nombre,
                user.email,
                user.telefono,
                year,
              );
            } catch (emailError) {
              console.error(
                `Error enviando email a admin ${admin.email}:`,
                emailError,
              );
            }
          }),
        );
      } else {
        console.warn(
          'No se encontraron administradores para notificar en el país:',
          user.pais.nombre,
        );
      }

      await this.notificacionService.notifyAdmins(
        NotificationType.NEW_CLIENT,
        'Nuevo Cliente Registrado',
        `Se registro el cliente ${user.nombre}`,
      );

      await this.mailService.verifyAccount(
        user.email,
        user.nombre,
        `${process.env.FRONTEND_URL_CLIENT}/verify-account/${user.email}`,
      );

      return user;
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async createTrabajador(
    createClienteDto: CreateAuthTrabajadorDto,
    propietario: Cliente,
  ) {
    try {
      const propietarioId = getPropietarioId(propietario);
      if (
        createClienteDto.rol !== TipoCliente.TRABAJADOR &&
        createClienteDto.rol !== TipoCliente.SUPERVISOR
      ) {
        throw new BadRequestException('Solo se pueden crear trabajadores');
      }

      const usuario_existe = await this.userRepository.findOne({
        where: { email: createClienteDto.email },
      });
      if (usuario_existe)
        throw new NotFoundException(
          'Ya existe un usuario registrado con este correo electronico',
        );

      const cliente_existe = await this.clienteRepository.findOne({
        where: { email: createClienteDto.email },
      });
      if (cliente_existe)
        throw new NotFoundException(
          'Ya existe un usuario registrado con este correo electronico',
        );

      const identificacion_existe = await this.userRepository.findOne({
        where: { identificacion: createClienteDto.identificacion },
      });
      if (identificacion_existe)
        throw new NotFoundException(
          'Ya existe un usuario registrado con esta identificacion',
        );

      const identificacion_existe_cliente =
        await this.clienteRepository.findOne({
          where: { identificacion: createClienteDto.identificacion },
        });
      if (identificacion_existe_cliente)
        throw new NotFoundException(
          'Ya existe un usuario registrado con esta identificacion',
        );

      const pais = await this.paisRepo.findOne({
        where: { id: createClienteDto.pais },
      });
      const departamento = await this.departamentoRepo.findOne({
        where: { id: createClienteDto.departamento },
      });
      const municipio = await this.municipioRepo.findOne({
        where: { id: createClienteDto.municipio },
      });

      if (!pais || !departamento || !municipio) {
        throw new BadRequestException(
          'País, departamento o municipio no válidos',
        );
      }

      let fincasValidas: FincasGanadero[] = [];
      if (
        createClienteDto.fincasAsignadas &&
        createClienteDto.fincasAsignadas.length > 0
      ) {
        fincasValidas = await this.fincasRepository.find({
          where: {
            id: In(createClienteDto.fincasAsignadas),
            propietario: { id: propietarioId },
          },
        });

        if (fincasValidas.length !== createClienteDto.fincasAsignadas.length) {
          throw new BadRequestException(
            'Una o más fincas no existen o no pertenecen al propietario',
          );
        }
      }

      const trabajador = this.clienteRepository.create({
        nombre: createClienteDto.nombre,
        identificacion: createClienteDto.identificacion,
        telefono: createClienteDto.telefono,
        email: createClienteDto.email,
        password: bcrypt.hashSync(createClienteDto.password, 10),
        direccion: createClienteDto.direccion,
        sexo: createClienteDto.sexo,
        pais,
        departamento,
        municipio,
        rol: createClienteDto.rol ?? TipoCliente.TRABAJADOR,
        isActive: createClienteDto.isActive ?? true,
        verified: createClienteDto.verified ?? false,
        propietario: { id: propietarioId },
      });

      await this.clienteRepository.save(trabajador);

      if (fincasValidas.length > 0) {
        const asignaciones = fincasValidas.map((finca) =>
          this.clienteFincaTrabajadorRepository.create({
            trabajador: { id: trabajador.id },
            finca: { id: finca.id },
            asignadoPor: { id: propietarioId },
            fechaAsignacion: new Date(),
          }),
        );

        await this.clienteFincaTrabajadorRepository.save(asignaciones);
      }

      return 'Trabajador Creado Exitosamente';
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async login(loginClienteDto: LoginClienteDto) {
    const { email, password } = loginClienteDto;

    try {
      const cliente = await this.clienteRepository
        .createQueryBuilder('cliente')
        .leftJoinAndSelect('cliente.pais', 'pais')
        .leftJoinAndSelect('pais.departamentos', 'departamentos')
        .leftJoinAndSelect('departamentos.municipios', 'municipios')
        .leftJoinAndSelect('cliente.departamento', 'departamento')
        .leftJoinAndSelect('departamento.municipios', 'dpt_municipios')
        .leftJoinAndSelect('cliente.municipio', 'municipio')
        .leftJoinAndSelect('cliente.profileImages', 'profileImages')
        .leftJoinAndSelect('cliente.asignacionesTrabajador', 'asignaciones')
        .leftJoinAndSelect('asignaciones.finca', 'finca')
        .leftJoinAndSelect('finca.departamento', 'finca_departamento')
        .leftJoinAndSelect('finca.municipio', 'finca_municipio')
        .leftJoinAndSelect('asignaciones.asignadoPor', 'asignadoPor')
        .leftJoinAndSelect('cliente.paquetes', 'clientePaquete')
        .leftJoinAndSelect('clientePaquete.paquete', 'paquete')
        .where('cliente.email = :email', { email })
        .orderBy('profileImages.createdAt', 'DESC')
        .getOne();

      if (!cliente)
        throw new UnauthorizedException('Credenciales incorrectas (email)');

      if (!bcrypt.compareSync(password, cliente.password))
        throw new UnauthorizedException(
          'Credenciales incorrectas (contrasena)',
        );

      if (!cliente.isActive)
        throw new UnauthorizedException(
          'Credenciales incorrectas, usuario desactivado.',
        );

      if (!cliente.verified)
        throw new UnauthorizedException(
          'El usuario no ha sido verificado, revisa tu correo electronico.',
        );

      const token = this.getJwtToken({ id: cliente.id });
      delete cliente.password;

      const propietarioId =
        cliente.rol !== TipoCliente.PROPIETARIO
          ? cliente.propietario?.id
          : cliente.id;

      const ahora = new Date();

      const paqueteActivo = await this.clientePaquete.findOne({
        where: {
          cliente: { id: propietarioId },
          activo: true,
        },
      });

      const paqueteVencido =
        !paqueteActivo ||
        (paqueteActivo.fechaFin && new Date(paqueteActivo.fechaFin) <= ahora);

      if (cliente.rol !== TipoCliente.PROPIETARIO && paqueteVencido) {
        throw new UnauthorizedException(
          'No puedes acceder, el paquete del propietario ha vencido o no existe.',
        );
      }

      let paqueteActivoData = null;
      let paqueteActivoInfo = null;

      if (cliente.rol === TipoCliente.PROPIETARIO) {
        paqueteActivoData = cliente.paquetes?.find(
          (cp: any) =>
            cp.activo === true &&
            (!cp.fechaFin || new Date(cp.fechaFin) > ahora),
        );
      } else {
        paqueteActivoData = await this.clientePaquete.findOne({
          where: {
            cliente: { id: propietarioId },
            activo: true,
          },
          relations: ['paquete'],
        });
      }

      if (paqueteActivoData) {
        const fechaFin = paqueteActivoData.fechaFin;
        const fechaInicio = paqueteActivoData.fechaInicio;

        const diasRestantes = fechaFin
          ? Math.ceil(
              (new Date(fechaFin).getTime() - ahora.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : null;

        const diasTotales =
          fechaInicio && fechaFin
            ? Math.ceil(
                (new Date(fechaFin).getTime() -
                  new Date(fechaInicio).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 0;

        paqueteActivoInfo = {
          id: paqueteActivoData.id,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          fechaInicioFormateada: formatearFechaEs(fechaInicio),
          fechaFinFormateada: fechaFin ? formatearFechaEs(fechaFin) : null,
          activo: paqueteActivoData.activo,
          diasRestantes: diasRestantes && diasRestantes > 0 ? diasRestantes : 0,
          diasTotales: diasTotales,
          estaVencido: diasRestantes !== null && diasRestantes <= 0,
          estaPorVencer:
            diasRestantes !== null && diasRestantes <= 7 && diasRestantes > 0,
          paquete: {
            id: paqueteActivoData.paquete?.id,
            nombre: paqueteActivoData.paquete?.nombre,
            tipo: paqueteActivoData.paquete?.tipo,
            maxFincas: paqueteActivoData.paquete?.maxFincas,
            maxAnimales: paqueteActivoData.paquete?.maxAnimales,
            maxTrabajadores: paqueteActivoData.paquete?.maxTrabajadores,
            isActive: paqueteActivoData.paquete?.isActive,
            ecommerce: paqueteActivoData.paquete?.ecommerce,
          },
        };
      }

      const clientePlano = instanceToPlain(cliente);
      const { paquetes, ...clienteSinPaquetes } = clientePlano;

      let propietarioInfo = null;
      if (cliente.rol !== TipoCliente.PROPIETARIO && cliente.propietario) {
        propietarioInfo = {
          id: cliente.propietario.id,
          nombre: cliente.propietario.nombre,
          email: cliente.propietario.email,
          telefono: cliente.propietario.telefono,
        };
      }

      return {
        ...clienteSinPaquetes,
        paqueteActivo: paqueteActivoInfo,
        tienePlanActivo: !!paqueteActivoData,
        propietario: propietarioInfo,
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async checkAuthStatus(cliente: Cliente) {
    delete cliente.password;
    return {
      ...cliente,
      token: this.getJwtToken({ id: cliente.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    if (!this.jwtService) {
      throw new InternalServerErrorException('JwtService no está disponible');
    }
    return this.jwtService.sign(payload);
  }

  async actualizarContrasena(updatePassword: UpdatePasswordDto) {
    const { email, nuevaContrasena } = updatePassword;

    try {
      const usuario = await this.clienteRepository.findOne({
        where: { email },
      });

      if (!usuario) {
        throw new NotFoundException('El correo no existe en la base de datos');
      }

      const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
      usuario.password = hashedPassword;

      await this.mailService.sendEmailConfirm(email, nuevaContrasena);
      await this.clienteRepository.save(usuario);
      return 'Contraseña actualizada exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async verificarCuenta(verifiedAccount: VerifiedAccountDto) {
    const { email } = verifiedAccount;
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { email },
        relations: ['pais', 'departamento', 'municipio'],
      });

      if (!cliente) {
        throw new NotFoundException(
          'Usuario no encontrado con este correo electrónico',
        );
      }

      if (cliente.verified === true) {
        throw new BadRequestException('La cuenta ya está verificada');
      }

      if (cliente.isActive === false) {
        throw new BadRequestException('La cuenta está desactivada');
      }

      cliente.verified = true;

      await this.clienteRepository.save(cliente);

      return {
        message: 'Cuenta verificada exitosamente',
        verified: true,
        user: {
          id: cliente.id,
          email: cliente.email,
          name: cliente.nombre,
          verified: cliente.verified,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('Error al verificar la cuenta ');
    }
  }

  async getClientesAdmin(user: User) {
    const paisId = user.pais.id;
    try {
      const clientes = await this.clienteRepository.find({
        where: { isActive: true, pais: { id: paisId } },
      });
      if (!clientes || clientes.length === 0) {
        throw new NotFoundException('No se encontraron clientes disponibles');
      }
      const clientes_activos = instanceToPlain(clientes);
      return { clientes: clientes_activos };
    } catch (error) {
      throw error;
    }
  }

  async getClientes(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, name, pais, rol } = paginationDto;
    try {
      const queryBuilder = this.clienteRepository
        .createQueryBuilder('cliente')
        .leftJoinAndSelect('cliente.pais', 'pais')
        .leftJoinAndSelect('cliente.paquetes', 'clientePaquetes')
        .leftJoinAndSelect('clientePaquetes.paquete', 'paquete')
        .leftJoinAndSelect('cliente.departamento', 'departamento')
        .leftJoinAndSelect('cliente.municipio', 'municipio');

      if (name) {
        queryBuilder.andWhere('cliente.nombre ILIKE :nombre', {
          name: `%${name}%`,
        });
      }

      if (pais) {
        queryBuilder.andWhere('pais.nombre ILIKE :pais', { pais: `%${pais}%` });
      }

      if (rol) {
        queryBuilder.andWhere('cliente.rol = :rol', { rol });
      }

      const [clients, total] = await queryBuilder
        .orderBy('cliente.nombre', 'ASC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      if (!clients || clients.length === 0) {
        throw new NotFoundException(
          'No se encontraron clientes en este momento.',
        );
      }

      const clientes = clients.map((cliente) => {
        const paqueteActivo = cliente.paquetes?.find(
          (p) =>
            p.activo && (!p.fechaFin || new Date(p.fechaFin) >= new Date()),
        );

        return {
          ...instanceToPlain(cliente),

          tienePaqueteActivo: !!paqueteActivo,

          paqueteActivo: paqueteActivo
            ? {
                id: paqueteActivo.paquete.id,
                nombre: paqueteActivo.paquete.nombre,
                fechaInicio: paqueteActivo.fechaInicio,
                fechaFin: paqueteActivo.fechaFin,
              }
            : null,
        };
      });

      return {
        clientes,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async getTrabajadores(paginationDto: PaginationDto, propietario: Cliente) {
    const propietarioId = getPropietarioId(propietario);

    if (!propietarioId) {
      throw new BadRequestException('Propietario inválido');
    }

    const { limit = 20, offset = 0, name, pais } = paginationDto;

    const queryBuilder = this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.pais', 'pais')
      .leftJoinAndSelect('cliente.departamento', 'departamento')
      .leftJoinAndSelect('cliente.municipio', 'municipio')
      .leftJoinAndSelect(
        'cliente.asignacionesTrabajador',
        'asignacionesTrabajador',
      )
      .leftJoinAndSelect('asignacionesTrabajador.finca', 'fincaAsignada')
      .leftJoin('cliente.propietario', 'propietario')
      .where('cliente.rol != :rol', { rol: TipoCliente.PROPIETARIO })
      .andWhere('propietario.id = :propietarioId', { propietarioId })
      .andWhere('cliente.id != :usuarioId', { usuarioId: propietario.id });

    if (name) {
      queryBuilder.andWhere('cliente.nombre ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (pais) {
      queryBuilder.andWhere('pais.nombre ILIKE :pais', {
        pais: `%${pais}%`,
      });
    }

    const [clients, total] = await queryBuilder
      .orderBy('cliente.nombre', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      trabajadores: instanceToPlain(clients),
      total,
    };
  }

  async getAllTrabajadores(usuario: Cliente) {
    try {
      const propietarioId = getPropietarioId(usuario);

      if (
        usuario.rol !== TipoCliente.PROPIETARIO &&
        usuario.rol !== TipoCliente.SUPERVISOR
      ) {
        throw new BadRequestException(
          'No tienes permisos para ver los trabajadores',
        );
      }

      const trabajadores = await this.clienteRepository.find({
        where: {
          propietarioId,
          rol: Not(TipoCliente.PROPIETARIO),
          id: Not(usuario.id),
        },
      });

      if (trabajadores.length === 0) {
        throw new NotFoundException(
          'No se encontraron trabajadores disponibles',
        );
      }

      return trabajadores;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['asignacionesTrabajador', 'asignacionesTrabajador.finca'],
    });
    if (!cliente)
      throw new NotFoundException('No se encontro el cliente seleccionado');
    return instanceToPlain(cliente);
  }

  async update(id: string, updateAuthClienteDto: UpdateAuthClienteDto) {
    const {
      email,
      nombre,
      direccion,
      identificacion,
      telefono,
      pais: paisId,
      departamento: departamentoId,
      municipio: municipioId,
      sexo,
      isActive,
      verified,
    } = updateAuthClienteDto;

    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['pais', 'departamento', 'municipio'],
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const isDesactandoCliente = isActive === false && cliente.isActive === true;

    if (email && email !== cliente.email) {
      const emailExists = await this.clienteRepository.findOne({
        where: { email },
      });
      if (emailExists && emailExists.id !== id) {
        throw new BadRequestException(
          'El email ya está registrado por otro cliente',
        );
      }

      const emailExistsUser = await this.userRepository.findOne({
        where: { email },
      });
      if (emailExistsUser) {
        throw new BadRequestException(
          'El email ya está registrado por un usuario',
        );
      }
    }

    if (identificacion && identificacion !== cliente.identificacion) {
      const identificacionExists = await this.clienteRepository.findOne({
        where: { identificacion },
      });
      if (identificacionExists && identificacionExists.id !== id) {
        throw new BadRequestException(
          'La identificación ya está registrada por otro cliente',
        );
      }

      const identificacionExistsUser = await this.userRepository.findOne({
        where: { identificacion },
      });
      if (identificacionExistsUser) {
        throw new BadRequestException(
          'La identificación ya está registrada por un usuario',
        );
      }
    }

    let pais_existe = cliente.pais;
    if (paisId && paisId !== cliente.pais?.id) {
      pais_existe = await this.paisRepo.findOne({ where: { id: paisId } });
      if (!pais_existe) {
        throw new BadRequestException('No se encontró el país seleccionado.');
      }
    }

    let departamento_existe = cliente.departamento;
    if (departamentoId && departamentoId !== cliente.departamento?.id) {
      departamento_existe = await this.departamentoRepo.findOne({
        where: { id: departamentoId },
      });
      if (!departamento_existe) {
        throw new BadRequestException(
          'No se encontró el departamento seleccionado.',
        );
      }
    }

    let municipio_existe = cliente.municipio;
    if (municipioId && municipioId !== cliente.municipio?.id) {
      municipio_existe = await this.municipioRepo.findOne({
        where: { id: municipioId },
      });
      if (!municipio_existe) {
        throw new BadRequestException(
          'No se encontró el municipio seleccionado.',
        );
      }
    }

    try {
      if (email) cliente.email = email;
      if (nombre) cliente.nombre = nombre;
      if (direccion) cliente.direccion = direccion;
      if (identificacion) cliente.identificacion = identificacion;
      if (telefono) cliente.telefono = telefono;
      if (sexo) cliente.sexo = sexo;
      if (isActive !== undefined) cliente.isActive = isActive;
      if (verified !== undefined) cliente.verified = verified;

      if (pais_existe) cliente.pais = pais_existe;
      if (departamento_existe) cliente.departamento = departamento_existe;
      if (municipio_existe) cliente.municipio = municipio_existe;

      await this.clienteRepository.save(cliente);

      if (isDesactandoCliente) {
        const trabajadoresActivos = await this.clienteRepository.find({
          where: {
            propietarioId: cliente.id,
            rol: Not(TipoCliente.PROPIETARIO),
            isActive: true,
          },
        });
        if (trabajadoresActivos.length > 0) {
          for (const trabajador of trabajadoresActivos) {
            trabajador.isActive = false;
            await this.clienteRepository.save(trabajador);
          }
        }
      }

      const { password, ...result } = cliente;

      return result;
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async updateTrabajador(
    id: string,
    updateAuthClienteDto: UpdateAuthTrabajadotDto,
    propietario: Cliente,
  ) {
    try {
      const {
        email,
        nombre,
        direccion,
        identificacion,
        telefono,
        pais: paisId,
        departamento: departamentoId,
        municipio: municipioId,
        sexo,
        isActive,
        verified,
        rol,
        password,
        fincasAsignadas,
      } = updateAuthClienteDto;

      const propietarioId = getPropietarioId(propietario);

      const trabajador = await this.clienteRepository.findOne({
        where: { id, rol: Not(TipoCliente.PROPIETARIO) },
        relations: ['pais', 'departamento', 'municipio', 'propietario'],
      });

      if (!trabajador) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      if (email && email !== trabajador.email) {
        const [usuarioExiste, clienteExiste] = await Promise.all([
          this.userRepository.findOne({ where: { email } }),
          this.clienteRepository.findOne({ where: { email } }),
        ]);

        if (usuarioExiste || clienteExiste) {
          throw new BadRequestException(
            'Ya existe un usuario registrado con este correo electrónico',
          );
        }
      }

      if (identificacion && identificacion !== trabajador.identificacion) {
        const [identificacionExiste, identificacionExisteCliente] =
          await Promise.all([
            this.userRepository.findOne({ where: { identificacion } }),
            this.clienteRepository.findOne({ where: { identificacion } }),
          ]);

        if (identificacionExiste || identificacionExisteCliente) {
          throw new BadRequestException(
            'Ya existe un usuario registrado con esta identificación',
          );
        }
      }

      if (telefono && telefono !== trabajador.telefono) {
        const [telefonoExiste, telefonoExisteCliente] = await Promise.all([
          this.userRepository.findOne({ where: { telefono } }),
          this.clienteRepository.findOne({ where: { telefono } }),
        ]);

        if (telefonoExiste || telefonoExisteCliente) {
          throw new BadRequestException(
            'Ya existe un usuario registrado con este teléfono',
          );
        }
      }

      if (paisId && paisId !== trabajador.pais?.id) {
        const pais = await this.paisRepo.findOne({ where: { id: paisId } });
        if (!pais) {
          throw new BadRequestException('País no encontrado');
        }
        trabajador.pais = pais;
      }

      if (departamentoId && departamentoId !== trabajador.departamento?.id) {
        const departamento = await this.departamentoRepo.findOne({
          where: { id: departamentoId },
        });
        if (!departamento) {
          throw new BadRequestException('Departamento no encontrado');
        }
        trabajador.departamento = departamento;
      }

      if (municipioId && municipioId !== trabajador.municipio?.id) {
        const municipio = await this.municipioRepo.findOne({
          where: { id: municipioId },
        });
        if (!municipio) {
          throw new BadRequestException('Municipio no encontrado');
        }
        trabajador.municipio = municipio;
      }

      if (email) trabajador.email = email;
      if (nombre) trabajador.nombre = nombre;
      if (direccion) trabajador.direccion = direccion;
      if (identificacion) trabajador.identificacion = identificacion;
      if (telefono) trabajador.telefono = telefono;
      if (sexo) trabajador.sexo = sexo;
      if (rol) trabajador.rol = rol;
      if (typeof isActive === 'boolean') trabajador.isActive = isActive;
      if (typeof verified === 'boolean') trabajador.verified = verified;

      if (password && password.trim() !== '') {
        trabajador.password = bcrypt.hashSync(password, 10);
      }

      const trabajadorActualizado =
        await this.clienteRepository.save(trabajador);

      delete trabajadorActualizado.password;

      if (fincasAsignadas !== undefined) {
        await this.actualizarFincasAsignadas(
          trabajador.id,
          fincasAsignadas,
          propietarioId,
        );
      }

      return {
        message: 'Trabajador actualizado exitosamente',
        trabajador: trabajadorActualizado,
      };
    } catch (error) {
      console.error('Error en update trabajador:', error);
      this.handleDatabaseErrors(error);
    }
  }

  private async actualizarFincasAsignadas(
    trabajadorId: string,
    nuevasFincasIds: string[],
    propietarioId: string,
  ) {
    if (nuevasFincasIds.length > 0) {
      const fincasValidas = await this.fincasRepository.find({
        where: {
          id: In(nuevasFincasIds),
          propietario: { id: propietarioId },
        },
      });

      if (fincasValidas.length !== nuevasFincasIds.length) {
        throw new BadRequestException(
          'Una o más fincas no existen o no pertenecen al propietario',
        );
      }
    }

    await this.clienteFincaTrabajadorRepository.delete({
      trabajador: { id: trabajadorId },
    });

    if (nuevasFincasIds.length > 0) {
      const nuevasAsignaciones = nuevasFincasIds.map((fincaId) =>
        this.clienteFincaTrabajadorRepository.create({
          trabajador: { id: trabajadorId },
          finca: { id: fincaId },
          asignadoPor: { id: propietarioId },
          fechaAsignacion: new Date(),
        }),
      );

      await this.clienteFincaTrabajadorRepository.save(nuevasAsignaciones);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} authCliente`;
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
