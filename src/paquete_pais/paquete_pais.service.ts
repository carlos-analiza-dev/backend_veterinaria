import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaquetePaiDto } from './dto/create-paquete_pai.dto';
import { UpdatePaquetePaiDto } from './dto/update-paquete_pai.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaquetePais } from './entities/paquete_pai.entity';
import { Repository } from 'typeorm';
import { Paquete } from 'src/paquetes/entities/paquete.entity';
import { Pai } from 'src/pais/entities/pai.entity';

@Injectable()
export class PaquetePaisService {
  constructor(
    @InjectRepository(PaquetePais)
    private paquetePaisRepository: Repository<PaquetePais>,
    @InjectRepository(Paquete)
    private paqueteRepository: Repository<Paquete>,
    @InjectRepository(Pai)
    private paisRepository: Repository<Pai>,
  ) {}
  async create(createPaquetePaiDto: CreatePaquetePaiDto): Promise<PaquetePais> {
    try {
      const { paqueteId, paisId, precioMensual, precioAnual, isActive } =
        createPaquetePaiDto;

      const paquete = await this.paqueteRepository.findOne({
        where: { id: paqueteId },
      });

      if (!paquete) {
        throw new NotFoundException(
          `Paquete con ID "${paqueteId}" no encontrado`,
        );
      }

      const pais = await this.paisRepository.findOne({
        where: { id: paisId },
      });

      if (!pais) {
        throw new NotFoundException(`País con ID "${paisId}" no encontrado`);
      }

      const existeRelacion = await this.paquetePaisRepository.findOne({
        where: {
          paquete: { id: paqueteId },
          pais: { id: paisId },
        },
      });

      if (existeRelacion) {
        throw new BadRequestException(
          `Ya existe un precio configurado para el paquete "${paquete.nombre}" en el país "${pais.nombre}"`,
        );
      }

      const paquetePais = this.paquetePaisRepository.create({
        paquete,
        pais,
        precioMensual,
        precioAnual: precioAnual || null,
        isActive: isActive !== undefined ? isActive : true,
      });

      return await this.paquetePaisRepository.save(paquetePais);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al crear el precio del paquete ');
    }
  }

  async findAll(): Promise<PaquetePais[]> {
    return await this.paquetePaisRepository.find({
      relations: ['paquete', 'pais'],
    });
  }

  async findActive(): Promise<PaquetePais[]> {
    return await this.paquetePaisRepository.find({
      where: { isActive: true },
      relations: ['paquete', 'pais'],
    });
  }

  async findOne(id: string): Promise<PaquetePais> {
    const paquetePais = await this.paquetePaisRepository.findOne({
      where: { id },
      relations: ['paquete', 'pais'],
    });

    if (!paquetePais) {
      throw new NotFoundException(
        `Precio de paquete con ID "${id}" no encontrado`,
      );
    }

    return paquetePais;
  }

  async update(
    id: string,
    updatePaquetePaiDto: UpdatePaquetePaiDto,
  ): Promise<PaquetePais> {
    const paquetePais = await this.findOne(id);

    if (updatePaquetePaiDto.paqueteId) {
      const paquete = await this.paqueteRepository.findOne({
        where: { id: updatePaquetePaiDto.paqueteId },
      });
      if (!paquete) {
        throw new NotFoundException(
          `Paquete con ID "${updatePaquetePaiDto.paqueteId}" no encontrado`,
        );
      }
      paquetePais.paquete = paquete;
    }

    if (updatePaquetePaiDto.paisId) {
      const pais = await this.paisRepository.findOne({
        where: { id: updatePaquetePaiDto.paisId },
      });
      if (!pais) {
        throw new NotFoundException(
          `País con ID "${updatePaquetePaiDto.paisId}" no encontrado`,
        );
      }
      paquetePais.pais = pais;
    }

    if (updatePaquetePaiDto.precioMensual !== undefined) {
      paquetePais.precioMensual = updatePaquetePaiDto.precioMensual;
    }

    if (updatePaquetePaiDto.precioAnual !== undefined) {
      paquetePais.precioAnual = updatePaquetePaiDto.precioAnual;
    }

    if (updatePaquetePaiDto.isActive !== undefined) {
      paquetePais.isActive = updatePaquetePaiDto.isActive;
    }

    if (updatePaquetePaiDto.paqueteId || updatePaquetePaiDto.paisId) {
      const existeRelacion = await this.paquetePaisRepository.findOne({
        where: {
          paquete: { id: paquetePais.paquete.id },
          pais: { id: paquetePais.pais.id },
        },
      });

      if (existeRelacion && existeRelacion.id !== id) {
        throw new BadRequestException(
          'Ya existe una configuración de precio para este paquete y país',
        );
      }
    }

    return await this.paquetePaisRepository.save(paquetePais);
  }
}
