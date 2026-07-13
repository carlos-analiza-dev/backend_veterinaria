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
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class DatosAgroservicioService {
  constructor(
    @InjectRepository(DatosAgroservicio)
    private readonly datosRepository: Repository<DatosAgroservicio>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(cliente: Cliente, createDto: CreateDatosAgroservicioDto) {
    const propietarioId = getPropietarioId(cliente);
    const existe = await this.datosRepository.findOne({
      where: [
        { rtn: createDto.rtn },
        { nombre_agroservicio: createDto.nombre_agroservicio },
      ],
    });

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

    const telefono_exist_cliente = await this.clienteRepo.findOne({
      where: { telefono: createDto.telefono },
    });
    const telefono_exist_user = await this.userRepo.findOne({
      where: { telefono: createDto.telefono },
    });

    if (telefono_exist_cliente || telefono_exist_user)
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
    const propietarioId = getPropietarioId(cliente);

    return await this.datosRepository.findOne({
      where: { propietarioId },
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

    if (updateDto.rtn) {
      updateDto.rtn = updateDto.rtn.replace(/-/g, '');
    }

    Object.assign(datosEmpresa, updateDto);

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
