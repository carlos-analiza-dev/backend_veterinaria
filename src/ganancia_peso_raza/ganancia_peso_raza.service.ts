// src/ganancia_peso_raza/ganancia_peso_raza.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  BadGatewayException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GananciaPesoRaza } from './entities/ganancia_peso_raza.entity';
import { CreateGananciaPesoRazaDto } from './dto/create-ganancia_peso_raza.dto';
import { UpdateGananciaPesoRazaDto } from './dto/update-ganancia_peso_raza.dto';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class GananciaPesoRazaService {
  constructor(
    @InjectRepository(GananciaPesoRaza)
    private readonly gananciaPesoRazaRepository: Repository<GananciaPesoRaza>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(RazaAnimal)
    private readonly razaRepository: Repository<RazaAnimal>,
  ) {}

  async create(
    createGananciaPesoRazaDto: CreateGananciaPesoRazaDto,
    cliente: Cliente,
  ) {
    const clienteId = cliente.id;

    try {
      if (
        createGananciaPesoRazaDto.gananciaMinima >
        createGananciaPesoRazaDto.gananciaMaxima
      ) {
        throw new BadRequestException(
          'La ganancia mínima por día no puede ser mayor que la ganancia máxima por día',
        );
      }

      if (
        createGananciaPesoRazaDto.gananciaMinima < 0 ||
        createGananciaPesoRazaDto.gananciaMinima > 3
      ) {
        throw new BadRequestException(
          'La ganancia mínima por día debe estar entre 0 y 3 lb/día',
        );
      }

      if (
        createGananciaPesoRazaDto.gananciaMaxima < 0 ||
        createGananciaPesoRazaDto.gananciaMaxima > 3
      ) {
        throw new BadRequestException(
          'La ganancia máxima por día debe estar entre 0 y 3 lb/día',
        );
      }

      if (!clienteId) {
        throw new BadRequestException('Se requiere el ID del cliente');
      }

      const cliente_exist = await this.clienteRepository.findOne({
        where: { id: clienteId, isActive: true },
      });

      if (!cliente_exist) {
        throw new NotFoundException(
          `Cliente con ID ${clienteId} no encontrado`,
        );
      }

      const raza = await this.razaRepository.findOne({
        where: { id: createGananciaPesoRazaDto.razaId, isActive: true },
      });

      if (!raza) {
        throw new NotFoundException(
          `Raza con ID ${createGananciaPesoRazaDto.razaId} no encontrada`,
        );
      }

      const existingConfig = await this.gananciaPesoRazaRepository.findOne({
        where: {
          cliente: { id: clienteId },
          raza: { id: createGananciaPesoRazaDto.razaId },
        },
      });

      if (existingConfig) {
        throw new BadGatewayException(
          'Ya existe una ganancia registrarda para esta raza',
        );
      }

      const gananciaPesoRaza = this.gananciaPesoRazaRepository.create({
        cliente,
        raza,
        gananciaMinima: createGananciaPesoRazaDto.gananciaMinima,
        gananciaMaxima: createGananciaPesoRazaDto.gananciaMaxima,
      });

      await this.gananciaPesoRazaRepository.save(gananciaPesoRaza);

      return 'Ganancia Registrada con Exito';
    } catch (error) {
      throw error;
    }
  }

  async findAll(clienteId?: string) {
    const whereCondition: any = { isActive: true };

    if (clienteId) {
      whereCondition.cliente = { id: clienteId };
    }

    return await this.gananciaPesoRazaRepository.find({
      where: whereCondition,
      relations: ['raza', 'cliente'],
      order: {
        raza: { nombre: 'ASC' },
      },
    });
  }

  async findByCliente(cliente: Cliente) {
    const clienteId = cliente.id ?? '';

    const cliente_exist = await this.clienteRepository.findOne({
      where: { id: clienteId, isActive: true },
    });

    if (!cliente_exist) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    return await this.gananciaPesoRazaRepository.find({
      where: {
        cliente: { id: clienteId },
        isActive: true,
      },
      relations: ['raza'],
      order: {
        raza: { nombre: 'ASC' },
      },
    });
  }

  async findByRaza(razaId: string) {
    const raza = await this.razaRepository.findOne({
      where: { id: razaId, isActive: true },
    });

    if (!raza) {
      throw new NotFoundException(`Raza con ID ${razaId} no encontrada`);
    }

    return await this.gananciaPesoRazaRepository.find({
      where: {
        raza: { id: razaId },
        isActive: true,
      },
      relations: ['cliente'],
      order: {
        cliente: { nombre: 'ASC' },
      },
    });
  }

  async findOne(id: string) {
    const gananciaPesoRaza = await this.gananciaPesoRazaRepository.findOne({
      where: { id, isActive: true },
      relations: ['raza', 'cliente'],
    });

    if (!gananciaPesoRaza) {
      throw new NotFoundException(
        `Configuración de ganancia con ID ${id} no encontrada`,
      );
    }

    return gananciaPesoRaza;
  }

  async findByClienteYRaza(clienteId: string, razaId: string) {
    const gananciaPesoRaza = await this.gananciaPesoRazaRepository.findOne({
      where: {
        cliente: { id: clienteId },
        raza: { id: razaId },
        isActive: true,
      },
      relations: ['raza'],
    });

    return gananciaPesoRaza;
  }

  async update(
    id: string,
    updateGananciaPesoRazaDto: UpdateGananciaPesoRazaDto,
    userId?: string,
  ) {
    const gananciaPesoRaza = await this.findOne(id);

    if (userId && gananciaPesoRaza.cliente.id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta configuración',
      );
    }

    if (
      updateGananciaPesoRazaDto.gananciaMinima !== undefined ||
      updateGananciaPesoRazaDto.gananciaMaxima !== undefined
    ) {
      const nuevaMinima =
        updateGananciaPesoRazaDto.gananciaMinima ??
        gananciaPesoRaza.gananciaMinima;
      const nuevaMaxima =
        updateGananciaPesoRazaDto.gananciaMaxima ??
        gananciaPesoRaza.gananciaMaxima;

      if (nuevaMinima > nuevaMaxima) {
        throw new BadRequestException(
          'La ganancia mínima por día no puede ser mayor que la ganancia máxima',
        );
      }

      if (nuevaMinima < 0 || nuevaMinima > 3) {
        throw new BadRequestException(
          'La ganancia mínima por día debe estar entre 0 y 3 lb/día',
        );
      }

      if (nuevaMaxima < 0 || nuevaMaxima > 3) {
        throw new BadRequestException(
          'La ganancia máxima por día debe estar entre 0 y 3 lb/día',
        );
      }
    }

    if (
      updateGananciaPesoRazaDto.razaId &&
      updateGananciaPesoRazaDto.razaId !== gananciaPesoRaza.raza.id
    ) {
      const existingConfig = await this.gananciaPesoRazaRepository.findOne({
        where: {
          cliente: { id: gananciaPesoRaza.cliente.id },
          raza: { id: updateGananciaPesoRazaDto.razaId },
          isActive: true,
        },
      });

      if (existingConfig) {
        throw new BadRequestException(
          'Ya existe una configuración para esta raza',
        );
      }

      const nuevaRaza = await this.razaRepository.findOne({
        where: { id: updateGananciaPesoRazaDto.razaId, isActive: true },
      });

      if (!nuevaRaza) {
        throw new NotFoundException(
          `Raza con ID ${updateGananciaPesoRazaDto.razaId} no encontrada`,
        );
      }

      gananciaPesoRaza.raza = nuevaRaza;
    }

    if (updateGananciaPesoRazaDto.gananciaMinima !== undefined) {
      gananciaPesoRaza.gananciaMinima =
        updateGananciaPesoRazaDto.gananciaMinima;
    }

    if (updateGananciaPesoRazaDto.gananciaMaxima !== undefined) {
      gananciaPesoRaza.gananciaMaxima =
        updateGananciaPesoRazaDto.gananciaMaxima;
    }

    gananciaPesoRaza.updatedAt = new Date();

    return await this.gananciaPesoRazaRepository.save(gananciaPesoRaza);
  }

  async remove(id: string, userId?: string) {
    const gananciaPesoRaza = await this.findOne(id);

    if (userId && gananciaPesoRaza.cliente.id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta configuración',
      );
    }

    gananciaPesoRaza.isActive = false;
    gananciaPesoRaza.updatedAt = new Date();

    await this.gananciaPesoRazaRepository.save(gananciaPesoRaza);

    return {
      message: 'Configuración de ganancia de peso eliminada exitosamente',
      id,
    };
  }

  async hardRemove(id: string) {
    const gananciaPesoRaza = await this.gananciaPesoRazaRepository.findOne({
      where: { id },
    });

    if (!gananciaPesoRaza) {
      throw new NotFoundException(
        `Configuración de ganancia con ID ${id} no encontrada`,
      );
    }

    await this.gananciaPesoRazaRepository.remove(gananciaPesoRaza);

    return {
      message: 'Configuración de ganancia de peso eliminada permanentemente',
      id,
    };
  }
}
