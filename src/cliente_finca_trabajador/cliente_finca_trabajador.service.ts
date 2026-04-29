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
import { Not, Repository } from 'typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { ClienteFincaTrabajador } from './entities/cliente_finca_trabajador.entity';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { instanceToPlain } from 'class-transformer';

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
    try {
      const { trabajadorId, fincaId } = dto;

      const trabajador = await this.clienteRepo.findOne({
        where: { id: trabajadorId },
      });

      if (!trabajador) throw new NotFoundException('Trabajador no encontrado');

      if (
        trabajador.rol !== TipoCliente.TRABAJADOR &&
        trabajador.rol !== TipoCliente.SUPERVISOR
      )
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

      await this.clienteFincaRepo.save(asignacion);

      return 'Finca Asignada con Exito';
    } catch (error) {
      throw error;
    }
  }

  async findAll(trabajadorId: string) {
    try {
      const trabajador = await this.clienteRepo.findOne({
        where: { id: trabajadorId, rol: Not(TipoCliente.PROPIETARIO) },
      });
      if (!trabajador)
        throw new NotFoundException(
          'No se encontro el trabajador seleccionado',
        );
      const fincas_asignadas = await this.clienteFincaRepo.find({
        where: { trabajador: { id: trabajadorId } },
        relations: ['trabajador', 'finca', 'asignadoPor'],
      });
      if (!fincas_asignadas)
        throw new NotFoundException(
          'No se encontraron fincas asignadas a este trabajador',
        );
      return instanceToPlain(fincas_asignadas);
    } catch (error) {
      throw error;
    }
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

  async remove(id: string) {
    const finca_asignada = await this.clienteFincaRepo.findOne({
      where: { id },
      relations: ['trabajador', 'finca'],
    });

    if (!finca_asignada) {
      throw new NotFoundException(
        'No se pudo ejecutar esta acción, asignación no encontrada',
      );
    }

    await this.clienteFincaRepo.remove(finca_asignada);

    return `El trabajador ${finca_asignada.trabajador.nombre} fue desasignado correctamente de la finca ${finca_asignada.finca.nombre_finca}`;
  }
}
