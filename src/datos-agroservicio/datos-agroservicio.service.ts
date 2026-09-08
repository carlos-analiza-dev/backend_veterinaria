import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDatosAgroservicioDto } from './dto/create-datos-agroservicio.dto';
import { UpdateDatosAgroservicioDto } from './dto/update-datos-agroservicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DatosAgroservicio } from './entities/datos-agroservicio.entity';
import { Repository } from 'typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { User } from 'src/auth/entities/auth.entity';
import { AgroservicioValidationService } from 'src/validations/validation-agroservicio.service';

@Injectable()
export class DatosAgroservicioService {
  constructor(
    @InjectRepository(DatosAgroservicio)
    private readonly datosRepository: Repository<DatosAgroservicio>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly validaAgro: AgroservicioValidationService,
  ) {}

  async create(cliente: Cliente, createDto: CreateDatosAgroservicioDto) {
    const propietarioId = cliente.id ?? '';
    const paisId = cliente.pais.id ?? '';
    const existe = await this.datosRepository
      .createQueryBuilder('datos')
      .where('datos.paisId = :paisId', { paisId })
      .andWhere(
        '(datos.rtn = :rtn OR datos.nombre_agroservicio = :nombreAgroservicio)',
        {
          rtn: createDto.rtn,
          nombreAgroservicio: createDto.nombre_agroservicio,
        },
      )
      .getOne();

    if (existe) throw new ConflictException('El RTN o nombre ya existen');

    const agro_pais = await this.datosRepository.findOne({
      where: {
        propietarioId: propietarioId,
        paisId: cliente.pais.id,
      },
    });

    if (agro_pais)
      throw new ConflictException(
        'Ya tienes el agroservicio registrado en este pais',
      );

    const telefono_existe_agro = await this.datosRepository.findOne({
      where: {
        telefono: createDto.telefono,
      },
    });

    const telefono_exist_cliente = await this.clienteRepo.findOne({
      where: { telefono: createDto.telefono },
    });
    const telefono_exist_user = await this.userRepo.findOne({
      where: { telefono: createDto.telefono },
    });

    if (telefono_exist_cliente || telefono_exist_user || telefono_existe_agro)
      throw new ConflictException(
        'El numero de telefono que ingresaste ya esta siendo usado',
      );

    const correo_exist_cliente = await this.clienteRepo.findOne({
      where: { email: createDto.correo },
    });
    const correo_exist_user = await this.userRepo.findOne({
      where: { email: createDto.correo },
    });

    if (correo_exist_cliente || correo_exist_user)
      throw new ConflictException(
        'El correo que ingresaste ya esta siendo usado',
      );

    const datos = this.datosRepository.create({
      ...createDto,
      propietarioId: propietarioId,
      paisId: cliente.pais.id ?? '',
    });

    return await this.datosRepository.save(datos);
  }

  async findAll(cliente: Cliente) {
    const propietarioId = cliente.id;
    const agroservicio =
      await this.validaAgro.obtenerAgroservicio(propietarioId);
    const agroservicioId = agroservicio.id;

    return await this.datosRepository.findOne({
      where: { id: agroservicioId },
      relations: ['propietario'],
    });
  }

  async findOne(id: string) {
    const datos = await this.datosRepository.findOne({
      where: { id },
      relations: ['propietario'],
    });

    if (!datos) throw new NotFoundException('Registro no encontrado');

    return datos;
  }

  async update(id: string, updateDto: UpdateDatosAgroservicioDto) {
    const datosEmpresa = await this.datosRepository.findOne({
      where: { id },
    });

    if (!datosEmpresa) {
      throw new NotFoundException('No se encontraron datos del agroservicio');
    }

    const rtn = updateDto.rtn
      ? updateDto.rtn.replace(/-/g, '')
      : datosEmpresa.rtn;

    const nombreAgroservicio =
      updateDto.nombre_agroservicio ?? datosEmpresa.nombre_agroservicio;

    const telefono = updateDto.telefono ?? datosEmpresa.telefono;

    const correo = updateDto.correo ?? datosEmpresa.correo;

    const existeRtnONombre = await this.datosRepository
      .createQueryBuilder('datos')
      .where('datos.id != :id', { id })
      .andWhere('datos.paisId = :paisId', {
        paisId: datosEmpresa.paisId,
      })
      .andWhere(
        '(datos.rtn = :rtn OR datos.nombre_agroservicio = :nombreAgroservicio)',
        {
          rtn,
          nombreAgroservicio,
        },
      )
      .getOne();

    if (existeRtnONombre) {
      throw new ConflictException(
        'El RTN o nombre del agroservicio ya existen',
      );
    }

    const telefonoExistCliente = await this.clienteRepo.findOne({
      where: {
        telefono,
      },
    });

    const telefonoExisteAgro = await this.datosRepository
      .createQueryBuilder('datos')
      .where('datos.telefono = :telefono', { telefono })
      .andWhere('datos.id != :id', { id })
      .getOne();

    const telefonoExistUser = await this.userRepo.findOne({
      where: {
        telefono,
      },
    });

    if (telefonoExistCliente || telefonoExistUser || telefonoExisteAgro) {
      throw new ConflictException(
        'El número de teléfono que ingresaste ya está siendo usado',
      );
    }

    const correoExistCliente = await this.clienteRepo.findOne({
      where: {
        email: correo,
      },
    });

    const correoExistUser = await this.userRepo.findOne({
      where: {
        email: correo,
      },
    });

    if (correoExistCliente || correoExistUser) {
      throw new ConflictException(
        'El correo que ingresaste ya está siendo usado',
      );
    }

    Object.assign(datosEmpresa, {
      ...updateDto,
      rtn,
    });

    return await this.datosRepository.save(datosEmpresa);
  }

  async remove(id: string) {
    const datos = await this.findOne(id);

    await this.datosRepository.remove(datos);

    return {
      message: 'Registro eliminado correctamente',
    };
  }
}
