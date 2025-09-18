import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthClienteDto } from './dto/create-auth-cliente.dto';
import { UpdateAuthClienteDto } from './dto/update-auth-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
        isActive: true,
      });

      await this.clienteRepository.save(user);
      delete user.password;

      return user;
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
        .where('cliente.email = :email', { email })
        .getOne();

      if (!cliente)
        throw new UnauthorizedException('Credenciales incorrectas (email)');

      if (!bcrypt.compareSync(password, cliente.password))
        throw new UnauthorizedException(
          'Credenciales incorrectas (contrasena)',
        );

      if (cliente.isActive === false)
        throw new UnauthorizedException(
          'Credenciales incorrectas, usario desactivado.',
        );

      const token = this.getJwtToken({ id: cliente.id });

      delete cliente.password;

      return { ...cliente, token };
    } catch (error) {
      throw error;
    }
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

  async checkAuthStatus(cliente: Cliente) {
    delete cliente.password;
    return {
      ...cliente,
      token: this.getJwtToken({ id: cliente.id }),
    };
  }

  async getClientes(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, name, pais } = paginationDto;
    try {
      const queryBuilder = this.clienteRepository
        .createQueryBuilder('cliente')
        .leftJoinAndSelect('cliente.pais', 'pais')
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

      const clientes = instanceToPlain(clients);
      return { clientes, total };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente)
      throw new NotFoundException('No se encontro el cliente seleccionado');
    return cliente;
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
    } = updateAuthClienteDto;

    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['pais', 'departamento', 'municipio'],
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

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

      if (pais_existe) cliente.pais = pais_existe;
      if (departamento_existe) cliente.departamento = departamento_existe;
      if (municipio_existe) cliente.municipio = municipio_existe;

      await this.clienteRepository.save(cliente);

      const { password, ...result } = cliente;

      return result;
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} authCliente`;
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
