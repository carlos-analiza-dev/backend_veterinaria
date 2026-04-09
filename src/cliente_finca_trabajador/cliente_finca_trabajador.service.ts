import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateClienteFincaTrabajadorDto } from './dto/create-cliente_finca_trabajador.dto';
import { UpdateClienteFincaTrabajadorDto } from './dto/update-cliente_finca_trabajador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Repository } from 'typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { ClienteFincaTrabajador } from './entities/cliente_finca_trabajador.entity';
import { TipoCliente } from 'src/interfaces/clientes.enums';

@Injectable()
export class ClienteFincaTrabajadorService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(FincasGanadero)
    private readonly fincasRepo: Repository<FincasGanadero>,
    @InjectRepository(ClienteFincaTrabajador)
    private readonly clienteFincaRepo: Repository<ClienteFincaTrabajador>,
  ) {}
  async create(dto: CreateClienteFincaTrabajadorDto, propietario: Cliente) {
    const { trabajadorId, fincaId } = dto;

    const trabajador = await this.clienteRepo.findOne({
      where: { id: trabajadorId },
    });

    if (!trabajador) throw new NotFoundException('Trabajador no encontrado');

    if (trabajador.rol !== TipoCliente.TRABAJADOR)
      throw new BadRequestException('El cliente no es trabajador');

    const finca = await this.fincasRepo.findOne({
      where: { id: fincaId },
      relations: ['propietario'],
    });

    if (!finca) throw new NotFoundException('Finca no encontrada');

    if (finca.propietario.id !== propietario.id) {
      throw new UnauthorizedException(
        'No puedes asignar trabajadores a esta finca',
      );
    }

    const existe = await this.clienteFincaRepo.findOne({
      where: {
        trabajador: { id: trabajadorId },
        finca: { id: fincaId },
      },
    });

    if (existe)
      throw new BadRequestException(
        'El trabajador ya está asignado a esta finca',
      );

    const asignacion = this.clienteFincaRepo.create({
      trabajador,
      finca,
      asignadoPor: propietario,
    });

    return await this.clienteFincaRepo.save(asignacion);
  }

  async findAll() {
    return await this.clienteFincaRepo.find({
      relations: ['trabajador', 'finca', 'asignadoPor'],
      order: { fechaAsignacion: 'DESC' },
    });
  }

  async findOne(id: string) {
    const asignacion = await this.clienteFincaRepo.findOne({
      where: { id },
      relations: ['trabajador', 'finca', 'asignadoPor'],
    });

    if (!asignacion) throw new NotFoundException('Asignación no encontrada');

    return asignacion;
  }

  async update(id: string, dto: UpdateClienteFincaTrabajadorDto) {
    const asignacion = await this.findOne(id);

    if (dto.trabajadorId) {
      const trabajador = await this.clienteRepo.findOne({
        where: { id: dto.trabajadorId },
      });

      if (!trabajador) throw new NotFoundException('Trabajador no encontrado');

      asignacion.trabajador = trabajador;
    }

    if (dto.fincaId) {
      const finca = await this.fincasRepo.findOne({
        where: { id: dto.fincaId },
      });

      if (!finca) throw new NotFoundException('Finca no encontrada');

      asignacion.finca = finca;
    }

    return await this.clienteFincaRepo.save(asignacion);
  }

  remove(id: number) {
    return `This action removes a #${id} clienteFincaTrabajador`;
  }
}
