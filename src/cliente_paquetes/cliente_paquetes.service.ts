import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientePaqueteDto } from './dto/create-cliente_paquete.dto';
import { UpdateClientePaqueteDto } from './dto/update-cliente_paquete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientePaquete } from './entities/cliente_paquete.entity';
import { IsNull, Repository } from 'typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { TipoPaquete } from 'src/interfaces/paquetes/paquetes.enum';

@Injectable()
export class ClientePaquetesService {
  constructor(
    @InjectRepository(ClientePaquete)
    private clientePaqueteRepository: Repository<ClientePaquete>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Paquete)
    private paqueteRepository: Repository<Paquete>,
  ) {}
  async create(
    createClientePaqueteDto: CreateClientePaqueteDto,
    cliente: Cliente,
  ) {
    const clienteId = cliente.id ?? '';
    try {
      const { paqueteId, fechaInicio, fechaFin } = createClientePaqueteDto;

      const cliente = await this.clienteRepository.findOne({
        where: { id: clienteId },
      });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID "${clienteId}" no encontrado`,
        );
      }

      const paquete = await this.paqueteRepository.findOne({
        where: { id: paqueteId },
      });

      if (!paquete) {
        throw new NotFoundException(
          `Paquete con ID "${paqueteId}" no encontrado`,
        );
      }

      if (paquete.tipo === TipoPaquete.FREE) {
        const yaTuvoPaqueteFree = await this.clientePaqueteRepository.findOne({
          where: {
            cliente: { id: clienteId },
            paquete: { id: paquete.id },
          },
        });

        if (yaTuvoPaqueteFree) {
          throw new BadRequestException(
            'El paquete FREE solo puede adquirirse una vez',
          );
        }
      }

      const startDate = fechaInicio ? new Date(fechaInicio) : new Date();
      const endDate = fechaFin ? new Date(fechaFin) : null;

      if (endDate && endDate <= startDate) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio',
        );
      }

      const paqueteActivo = await this.findActiveByClienteAndPaquete(
        clienteId,
        paqueteId,
      );
      if (paqueteActivo) {
        throw new BadRequestException(
          `El cliente ya tiene el paquete "${paquete.nombre}" activo`,
        );
      }

      const paqueteActivoCliente = await this.clientePaqueteRepository.findOne({
        where: { cliente: { id: clienteId }, activo: true },
      });

      if (paqueteActivoCliente) {
        paqueteActivoCliente.activo = false;

        await this.clientePaqueteRepository.save(paqueteActivoCliente);
      }

      const clientePaquete = this.clientePaqueteRepository.create({
        cliente,
        paquete,
        fechaInicio: startDate,
        fechaFin: endDate,
      });

      return await this.clientePaqueteRepository.save(clientePaquete);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al asignar el paquete al cliente');
    }
  }

  async findAll(): Promise<ClientePaquete[]> {
    return await this.clientePaqueteRepository.find({
      relations: ['cliente', 'paquete'],
      order: { fechaInicio: 'DESC' },
    });
  }

  async findByClienteHistorial(cliente: Cliente) {
    const clienteId = cliente.id ?? '';
    try {
      const paqueteActivos = await this.clientePaqueteRepository.find({
        where: { cliente: { id: clienteId } },
      });
      if (!paqueteActivos)
        throw new NotFoundException(
          'No se encontro paquete activo actualmente',
        );
      return paqueteActivos;
    } catch (error) {
      throw error;
    }
  }

  async findByCliente(cliente: Cliente) {
    const clienteId = cliente.id ?? '';
    try {
      const paqueteActivo = await this.clientePaqueteRepository.findOne({
        where: { cliente: { id: clienteId }, activo: true },
      });
      if (!paqueteActivo)
        throw new NotFoundException(
          'No se encontro paquete activo actualmente',
        );
      return paqueteActivo;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<ClientePaquete> {
    const clientePaquete = await this.clientePaqueteRepository.findOne({
      where: { id },
      relations: ['cliente', 'paquete'],
    });

    if (!clientePaquete) {
      throw new NotFoundException(
        `Asignación de paquete con ID "${id}" no encontrada`,
      );
    }

    return clientePaquete;
  }

  async findActiveByCliente(clienteId: string): Promise<ClientePaquete[]> {
    const cliente = await this.clienteRepository.findOne({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID "${clienteId}" no encontrado`,
      );
    }

    const now = new Date();
    return await this.clientePaqueteRepository.find({
      where: {
        cliente: { id: clienteId },
        fechaFin: IsNull(),
      },
      relations: ['cliente', 'paquete'],
      order: { fechaInicio: 'DESC' },
    });
  }

  async findActiveByClienteAndPaquete(
    clienteId: string,
    paqueteId: string,
  ): Promise<ClientePaquete | null> {
    return await this.clientePaqueteRepository.findOne({
      where: {
        cliente: { id: clienteId },
        paquete: { id: paqueteId },
        fechaFin: IsNull(),
      },
      relations: ['cliente', 'paquete'],
    });
  }

  async update(
    id: string,
    updateClientePaqueteDto: UpdateClientePaqueteDto,
  ): Promise<ClientePaquete> {
    const clientePaquete = await this.findOne(id);

    if (updateClientePaqueteDto.paqueteId) {
      const paquete = await this.paqueteRepository.findOne({
        where: { id: updateClientePaqueteDto.paqueteId },
      });

      if (!paquete) {
        throw new NotFoundException(
          `Paquete con ID "${updateClientePaqueteDto.paqueteId}" no encontrado`,
        );
      }

      if (clientePaquete.activo) {
        const existingActive = await this.findActiveByClienteAndPaquete(
          clientePaquete.cliente.id,
          updateClientePaqueteDto.paqueteId,
        );

        if (existingActive && existingActive.id !== id) {
          throw new BadRequestException(
            `El cliente ya tiene el paquete "${paquete.nombre}" activo`,
          );
        }
      }

      clientePaquete.paquete = paquete;
    }

    const nuevaFechaInicio = updateClientePaqueteDto.fechaInicio
      ? new Date(updateClientePaqueteDto.fechaInicio)
      : clientePaquete.fechaInicio;

    const nuevaFechaFin =
      updateClientePaqueteDto.fechaFin !== undefined
        ? updateClientePaqueteDto.fechaFin
          ? new Date(updateClientePaqueteDto.fechaFin)
          : null
        : clientePaquete.fechaFin;

    if (nuevaFechaFin && nuevaFechaInicio >= nuevaFechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    clientePaquete.fechaInicio = nuevaFechaInicio;
    clientePaquete.fechaFin = nuevaFechaFin;

    if (updateClientePaqueteDto.activo !== undefined) {
      clientePaquete.activo = updateClientePaqueteDto.activo;
    }

    return await this.clientePaqueteRepository.save(clientePaquete);
  }
}
