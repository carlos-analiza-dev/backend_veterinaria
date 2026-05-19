import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaqueteDto } from './dto/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/update-paquete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paquete } from './entities/paquete.entity';
import { Repository } from 'typeorm';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquete)
    private paqueteRepository: Repository<Paquete>,
  ) {}
  async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquete> {
    try {
      const existePaquete = await this.paqueteRepository.findOne({
        where: { nombre: createPaqueteDto.nombre },
      });

      if (existePaquete) {
        throw new BadRequestException(
          `Ya existe un paquete con el nombre "${createPaqueteDto.nombre}"`,
        );
      }

      const paquete = this.paqueteRepository.create(createPaqueteDto);
      return await this.paqueteRepository.save(paquete);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el paquete');
    }
  }

  async findAll(): Promise<Paquete[]> {
    return await this.paqueteRepository.find({
      relations: ['preciosPorPais', 'permisos'],
    });
  }

  async findByPais(cliente: Cliente): Promise<Paquete[]> {
    const paisId = cliente.pais.id ?? '';
    return await this.paqueteRepository.find({
      where: { isActive: true, preciosPorPais: { pais: { id: paisId } } },
      relations: ['preciosPorPais'],
    });
  }

  async findOne(id: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { id },
      relations: ['preciosPorPais', 'permisos'],
    });

    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado`);
    }

    return paquete;
  }

  async update(
    id: string,
    updatePaqueteDto: UpdatePaqueteDto,
  ): Promise<Paquete> {
    const paquete = await this.findOne(id);

    if (updatePaqueteDto.nombre && updatePaqueteDto.nombre !== paquete.nombre) {
      const existePaquete = await this.paqueteRepository.findOne({
        where: { nombre: updatePaqueteDto.nombre },
      });

      if (existePaquete) {
        throw new BadRequestException(
          `Ya existe un paquete con el nombre "${updatePaqueteDto.nombre}"`,
        );
      }
    }

    Object.assign(paquete, updatePaqueteDto);

    return await this.paqueteRepository.save(paquete);
  }
}
