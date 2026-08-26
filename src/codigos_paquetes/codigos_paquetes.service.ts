import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CodigosPaquete } from './entities/codigos_paquete.entity';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { ClientePaquete } from 'src/cliente_paquetes/entities/cliente_paquete.entity';
import { CreateCodigosPaqueteDto } from './dto/create-codigos_paquete.dto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { UpdateCodigosPaqueteDto } from './dto/update-codigos_paquete.dto';
import { AsignarPaqueteCodigoDto } from './dto/asignar-paquete.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { TipoCliente } from 'src/interfaces/clientes.enums';

@Injectable()
export class CodigosPaquetesService {
  constructor(
    @InjectRepository(CodigosPaquete)
    private readonly codigoPaquetesRepo: Repository<CodigosPaquete>,

    @InjectRepository(Paquete)
    private readonly paqueteRepo: Repository<Paquete>,

    @InjectRepository(ClientePaquete)
    private readonly clientePaquetesRepo: Repository<ClientePaquete>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createCodigosPaqueteDto: CreateCodigosPaqueteDto,
  ): Promise<CodigosPaquete> {
    const { codigo, paqueteId, activo, fechaExpiracion } =
      createCodigosPaqueteDto;

    const paquete = await this.paqueteRepo.findOne({
      where: {
        id: paqueteId,
      },
    });

    if (!paquete) {
      throw new NotFoundException(
        `El paquete con ID "${paqueteId}" no existe.`,
      );
    }

    const codigoExistente = await this.codigoPaquetesRepo.findOne({
      where: {
        codigo,
      },
    });

    if (codigoExistente) {
      throw new ConflictException(
        `El código "${codigo}" ya se encuentra registrado.`,
      );
    }

    const nuevoCodigo = this.codigoPaquetesRepo.create({
      codigo,
      paquete,
      paqueteId,
      activo: activo ?? true,
      fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : null,
    });

    return await this.codigoPaquetesRepo.save(nuevoCodigo);
  }

  async asignarPaquetePorCodigo(
    cliente: Cliente,
    asignarPaqueteCodigoDto: AsignarPaqueteCodigoDto,
  ) {
    const codigo = asignarPaqueteCodigoDto.codigo.trim().toUpperCase();

    if (cliente.rol !== TipoCliente.PROPIETARIO) {
      throw new BadRequestException(
        'Para ejecutar esta acción debes ser propietario del agroservicio.',
      );
    }

    const clienteId = cliente.id;

    return await this.dataSource.transaction(async (manager) => {
      const codigoRepo = manager.getRepository(CodigosPaquete);
      const clientePaqueteRepo = manager.getRepository(ClientePaquete);
      const paqueteRepo = manager.getRepository(Paquete);
      const clienteRepo = manager.getRepository(Cliente);

      const clienteEncontrado = await clienteRepo.findOne({
        where: {
          id: clienteId,
        },
      });

      if (!clienteEncontrado) {
        throw new NotFoundException(
          `El cliente con ID "${clienteId}" no existe.`,
        );
      }

      const codigoPaquete = await codigoRepo.findOne({
        where: {
          codigo,
        },
        relations: {
          paquete: true,
        },
      });

      if (!codigoPaquete) {
        throw new NotFoundException(`El código "${codigo}" no existe.`);
      }

      if (!codigoPaquete.activo) {
        throw new ConflictException(
          `El código "${codigo}" se encuentra inactivo.`,
        );
      }

      if (
        codigoPaquete.fechaExpiracion &&
        codigoPaquete.fechaExpiracion <= new Date()
      ) {
        throw new ConflictException(`El código "${codigo}" ha expirado.`);
      }

      const paquete = await paqueteRepo.findOne({
        where: {
          id: codigoPaquete.paqueteId,
        },
      });

      if (!paquete) {
        throw new NotFoundException(
          `El paquete asociado al código "${codigo}" no existe.`,
        );
      }

      if (!paquete.isActive) {
        throw new ConflictException(
          `El paquete "${paquete.nombre}" no se encuentra activo.`,
        );
      }

      const paqueteActual = await clientePaqueteRepo.findOne({
        where: {
          cliente: {
            id: clienteId,
          },
          activo: true,
        },
        relations: {
          paquete: true,
        },
      });

      if (paqueteActual) {
        paqueteActual.activo = false;

        await clientePaqueteRepo.save(paqueteActual);
      }

      const fechaInicio = new Date();
      fechaInicio.setHours(0, 0, 0, 0);

      const fechaFin = new Date(fechaInicio);
      fechaFin.setMonth(fechaFin.getMonth() + 1);
      fechaFin.setDate(fechaFin.getDate() - 1);
      fechaFin.setHours(23, 59, 59, 999);

      const nuevoClientePaquete = clientePaqueteRepo.create({
        cliente: clienteEncontrado,
        paquete,
        fechaInicio,
        fechaFin,
        activo: true,
      });

      await clientePaqueteRepo.save(nuevoClientePaquete);

      return `El paquete "${paquete.nombre}" fue asignado correctamente al cliente.`;
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: CodigosPaquete[];
    total: number;
  }> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [data, total] = await this.codigoPaquetesRepo.findAndCount({
      relations: {
        paquete: true,
      },
      order: {
        codigo: 'ASC',
      },
      take: limit,
      skip: offset,
    });

    return {
      data,
      total,
    };
  }

  async findOne(id: string): Promise<CodigosPaquete> {
    const codigoPaquete = await this.codigoPaquetesRepo.findOne({
      where: {
        id,
      },
      relations: {
        paquete: true,
      },
    });

    if (!codigoPaquete) {
      throw new NotFoundException(
        `El código de paquete con ID "${id}" no existe.`,
      );
    }

    return codigoPaquete;
  }

  async update(
    id: string,
    updateCodigosPaqueteDto: UpdateCodigosPaqueteDto,
  ): Promise<CodigosPaquete> {
    const codigoPaquete = await this.codigoPaquetesRepo.findOne({
      where: {
        id,
      },
    });

    if (!codigoPaquete) {
      throw new NotFoundException(
        `El código de paquete con ID "${id}" no existe.`,
      );
    }

    const { codigo, paqueteId, activo, fechaExpiracion } =
      updateCodigosPaqueteDto;

    if (codigo && codigo !== codigoPaquete.codigo) {
      const codigoExistente = await this.codigoPaquetesRepo.findOne({
        where: {
          codigo,
        },
        select: {
          id: true,
        },
      });

      if (codigoExistente && codigoExistente.id !== id) {
        throw new ConflictException(
          `El código "${codigo}" ya se encuentra registrado.`,
        );
      }

      codigoPaquete.codigo = codigo.toUpperCase();
    }

    if (paqueteId && paqueteId !== codigoPaquete.paqueteId) {
      const paquete = await this.paqueteRepo.findOne({
        where: {
          id: paqueteId,
        },
      });

      if (!paquete) {
        throw new NotFoundException(
          `El paquete con ID "${paqueteId}" no existe.`,
        );
      }

      codigoPaquete.paquete = paquete;
      codigoPaquete.paqueteId = paqueteId;
    }

    if (activo !== undefined) {
      codigoPaquete.activo = activo;
    }

    if (fechaExpiracion !== undefined) {
      codigoPaquete.fechaExpiracion = fechaExpiracion
        ? new Date(fechaExpiracion)
        : null;
    }

    return await this.codigoPaquetesRepo.save(codigoPaquete);
  }

  async remove(id: string): Promise<{
    message: string;
  }> {
    const codigoPaquete = await this.codigoPaquetesRepo.findOne({
      where: {
        id,
      },
    });

    if (!codigoPaquete) {
      throw new NotFoundException(
        `El código de paquete con ID "${id}" no existe.`,
      );
    }

    await this.codigoPaquetesRepo.remove(codigoPaquete);

    return {
      message: `El código "${codigoPaquete.codigo}" fue eliminado correctamente.`,
    };
  }
}
