import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Pai } from 'src/pais/entities/pai.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { MailService } from 'src/mail/mail.service';
import { PaginationDto } from '../common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { Role } from 'src/roles/entities/role.entity';
import { ValidRoles } from 'src/interfaces/valid-roles.interface';
import { Sucursal } from 'src/sucursales/entities/sucursal.entity';
import { VerifiedAccountDto } from './dto/verify-account';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Pai) private readonly paisRepo: Repository<Pai>,
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepo: Repository<MunicipiosDepartamentosPai>,
    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepo: Repository<DepartamentosPai>,
    @InjectRepository(Role)
    private readonly rolRepo: Repository<Role>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const {
      email,
      name,
      password,
      direccion,
      identificacion,
      telefono,
      pais: paisId,
      departamento: departamentoId,
      municipio: municipioId,
      sucursal: sucursalId,
      role,
      sexo,
    } = createUserDto;

    const correo_existe = await this.userRepository.findOne({
      where: { email },
    });
    if (correo_existe)
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

    const sucursal_existe = await this.sucursalRepository.findOne({
      where: { id: sucursalId },
    });
    if (!sucursal_existe) {
      throw new BadRequestException('No se encontró la sucursal seleccionado.');
    }

    const municipio_existe = await this.municipioRepo.findOne({
      where: { id: municipioId },
    });
    if (!municipio_existe) {
      throw new BadRequestException(
        'No se encontró el municipio seleccionado.',
      );
    }

    let rol_exits;
    if (role) {
      rol_exits = await this.rolRepo.findOne({ where: { id: role } });
      if (!rol_exits) {
        throw new NotFoundException(
          'El rol seleccionado no se encontró en la base de datos',
        );
      }
    } else {
      rol_exits = await this.rolRepo.findOne({
        where: { name: ValidRoles.Ganadero },
      });
      if (!rol_exits) {
        throw new NotFoundException(
          'El rol Gamadero no está configurado en el sistema',
        );
      }
    }

    try {
      const user = this.userRepository.create({
        email,
        password: bcrypt.hashSync(password, 10),
        name,
        direccion,
        identificacion,
        telefono,
        pais: pais_existe,
        departamento: departamento_existe,
        municipio: municipio_existe,
        sucursal: sucursal_existe,
        role: rol_exits,
        sexo,
        isActive: true,
        isAuthorized: false,
        verified: false,
      });

      await this.userRepository.save(user);
      delete user.password;

      await this.mailService.verifyAccount(
        user.email,
        user.name,
        `${process.env.FRONTEND_URL}/verify-account/${user.email}`,
      );

      return user;
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.pais', 'pais')
        .leftJoinAndSelect('pais.departamentos', 'departamentos')
        .leftJoinAndSelect('departamentos.municipios', 'municipios')
        .leftJoinAndSelect('user.departamento', 'departamento')
        .leftJoinAndSelect('departamento.municipios', 'dpt_municipios')
        .leftJoinAndSelect('user.municipio', 'municipio')
        .leftJoinAndSelect('user.sucursal', 'sucursal')
        .leftJoinAndSelect('user.profileImages', 'profileImages')
        .where('user.email = :email', { email })
        .orderBy('profileImages.createdAt', 'DESC')
        .getOne();

      if (!user)
        throw new UnauthorizedException('Credenciales incorrectas (email)');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException(
          'Credenciales incorrectas (contrasena)',
        );

      if (user.isActive === false)
        throw new UnauthorizedException(
          'Credenciales incorrectas, usario desactivado.',
        );

      if (user.isAuthorized === false)
        throw new UnauthorizedException(
          'Credenciales incorrectas, usario no autorizado.',
        );

      if (user.verified === false)
        throw new UnauthorizedException(
          'El usuario no ha sido verificado, revisa tu correo electronico.',
        );

      const token = this.getJwtToken({ id: user.id });

      delete user.password;

      return { ...user, token };
    } catch (error) {
      throw error;
    }
  }

  async actualizarContrasena(updatePassword: UpdatePasswordDto) {
    const { email, nuevaContrasena } = updatePassword;

    try {
      const usuario = await this.userRepository.findOne({ where: { email } });

      if (!usuario) {
        throw new NotFoundException('El correo no existe en la base de datos');
      }

      const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
      usuario.password = hashedPassword;

      await this.mailService.sendEmailConfirm(email, nuevaContrasena);
      await this.userRepository.save(usuario);
      return 'Contraseña actualizada exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async verificarCuenta(verifiedAccount: VerifiedAccountDto) {
    const { email } = verifiedAccount;
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role', 'pais', 'departamento', 'municipio', 'sucursal'],
      });

      if (!user) {
        throw new NotFoundException(
          'Usuario no encontrado con este correo electrónico',
        );
      }

      if (user.verified === true) {
        throw new BadRequestException('La cuenta ya está verificada');
      }

      if (user.isActive === false) {
        throw new BadRequestException('La cuenta está desactivada');
      }

      if (user.isAuthorized === false) {
        throw new BadRequestException(
          'La cuenta no está autorizada por el administrador',
        );
      }

      user.verified = true;

      await this.userRepository.save(user);

      return {
        message: 'Cuenta verificada exitosamente',
        verified: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified,
          role: user.role?.name,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Error al verificar la cuenta: ' + error.message,
      );
    }
  }

  async getUsers(user: User, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, name, rol, pais } = paginationDto;
    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.profileImages', 'profileImages')
        .leftJoinAndSelect('user.pais', 'pais')
        .where('user.id != :id', { id: user.id });

      if (name) {
        queryBuilder.andWhere('user.name ILIKE :name', { name: `%${name}%` });
      }

      if (rol) {
        queryBuilder.andWhere('role.name ILIKE :rol', { rol: `%${rol}%` });
      }

      if (pais) {
        queryBuilder.andWhere('pais.nombre ILIKE :pais', { pais: `%${pais}%` });
      }

      const [usuarios, total] = await queryBuilder
        .orderBy('user.name', 'ASC')
        .addOrderBy('profileImages.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      if (!usuarios || usuarios.length === 0) {
        throw new NotFoundException(
          'No se encontraron usuarios en este momento.',
        );
      }

      const users = instanceToPlain(usuarios);
      return { users, total };
    } catch (error) {
      throw error;
    }
  }

  async getVeterinariosNoAsignados(user: User) {
    const paisId = user.pais.id;

    try {
      const veterinariosNoAsignados = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoin('medicos', 'medico', 'medico.usuarioId = user.id')
        .where('user.isActive = :isActive', { isActive: true })
        .andWhere('role.name = :roleName', { roleName: 'Veterinario' })
        .andWhere('medico.id IS NULL')
        .andWhere('user.paisId = :paisId', { paisId })
        .orderBy('user.name', 'ASC')
        .getMany();

      if (!veterinariosNoAsignados || veterinariosNoAsignados.length === 0) {
        throw new NotFoundException(
          'No se encontraron veterinarios disponibles para asignar como médicos en tu país.',
        );
      }

      return instanceToPlain(veterinariosNoAsignados);
    } catch (error) {
      throw error;
    }
  }
  async getUserById(userId: string) {
    try {
      const usuario = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!usuario)
        throw new NotFoundException('No se encontro el usuario seleccionado.');
      return instanceToPlain(usuario);
    } catch (error) {
      throw error;
    }
  }

  async actualizarUsuario(userId: string, updateUsuarioDto: UpdateUserDto) {
    try {
      const usuario = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['pais', 'role', 'departamento', 'municipio'],
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (updateUsuarioDto.pais) {
        const pais = await this.paisRepo.findOne({
          where: { id: updateUsuarioDto.pais },
        });
        if (!pais)
          throw new BadRequestException('El país seleccionado no existe');
        usuario.pais = pais;
      }

      if (updateUsuarioDto.role) {
        const nuevoRol = await this.rolRepo.findOne({
          where: { id: updateUsuarioDto.role },
        });
        if (!nuevoRol)
          throw new NotFoundException('El rol proporcionado no existe');
        usuario.role = nuevoRol;
      }

      if (updateUsuarioDto.departamento) {
        const departamento = await this.departamentoRepo.findOne({
          where: { id: updateUsuarioDto.departamento },
        });
        if (!departamento)
          throw new BadRequestException(
            'El departamento seleccionado no existe',
          );
        usuario.departamento = departamento;
      }

      if (updateUsuarioDto.municipio) {
        const municipio = await this.municipioRepo.findOne({
          where: { id: updateUsuarioDto.municipio },
          relations: ['departamento'],
        });
        if (!municipio)
          throw new BadRequestException('El municipio seleccionado no existe');

        if (
          updateUsuarioDto.departamento &&
          municipio.departamento.id !== updateUsuarioDto.departamento
        ) {
          throw new BadRequestException(
            'El municipio no pertenece al departamento seleccionado',
          );
        }
        usuario.municipio = municipio;
      }

      if (updateUsuarioDto.sucursal) {
        const sucursal = await this.sucursalRepository.findOne({
          where: { id: updateUsuarioDto.sucursal },
        });
        if (!sucursal)
          throw new BadRequestException('La sucursal seleccionado no existe');

        usuario.sucursal = sucursal;
      }

      const camposActualizables = [
        'email',
        'name',
        'identificacion',
        'direccion',
        'sexo',
        'telefono',
        'isActive',
        'isAuthorized',
      ];

      camposActualizables.forEach((campo) => {
        if (updateUsuarioDto[campo] !== undefined) {
          usuario[campo] = updateUsuarioDto[campo];
        }
      });

      if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
        const emailExiste = await this.userRepository.findOne({
          where: { email: updateUsuarioDto.email },
        });
        if (emailExiste && emailExiste.id !== userId) {
          throw new BadRequestException(
            'El correo electrónico ya está registrado',
          );
        }
      }

      if (
        updateUsuarioDto.identificacion &&
        updateUsuarioDto.identificacion !== usuario.identificacion
      ) {
        const identificacionExiste = await this.userRepository.findOne({
          where: { identificacion: updateUsuarioDto.identificacion },
        });
        if (identificacionExiste && identificacionExiste.id !== userId) {
          throw new BadRequestException('La identificación ya está registrada');
        }
      }

      await this.userRepository.save(usuario);

      const usuarioActualizado = instanceToPlain(usuario);
      delete usuarioActualizado.password;

      return usuarioActualizado;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar usuario');
    }
  }

  async checkAuthStatus(user: User) {
    delete user.password;
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    if (!this.jwtService) {
      throw new InternalServerErrorException('JwtService no está disponible');
    }
    return this.jwtService.sign(payload);
  }

  private handleDatabaseErrors(error: any): never {
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

    throw new error();
  }
}
