import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDescuentosClienteDto } from './dto/create-descuentos_cliente.dto';
import { UpdateDescuentosClienteDto } from './dto/update-descuentos_cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DescuentosCliente } from './entities/descuentos_cliente.entity';
import { Repository } from 'typeorm';
import { Pai } from 'src/pais/entities/pai.entity';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class DescuentosClientesService {
  constructor(
    @InjectRepository(DescuentosCliente)
    private readonly descuentos_repo: Repository<DescuentosCliente>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
  ) {}

  async create(createDescuentosPaiDto: CreateDescuentosClienteDto) {
    const { nombre, paisId, porcentaje } = createDescuentosPaiDto;
    const pais_exist = await this.paisRepo.findOne({ where: { id: paisId } });

    if (!pais_exist) {
      throw new NotFoundException('No se encontró el país seleccionado');
    }

    const taxe = this.descuentos_repo.create({
      nombre,
      porcentaje,
      pais: pais_exist,
    });
    await this.descuentos_repo.save(taxe);

    return {
      message: 'Impuesto creado exitosamente',
      taxe,
    };
  }

  async findAll(user: User) {
    const paisId = user.pais.id;
    try {
      const pais_exist = await this.paisRepo.findOne({ where: { id: paisId } });

      if (!pais_exist) {
        throw new NotFoundException('No se encontró el país seleccionado');
      }
      const taxes = await this.descuentos_repo.find({
        where: {
          pais: { id: paisId },
        },
        relations: ['pais'],
        order: { nombre: 'ASC' },
      });
      if (!taxes || taxes.length === 0) {
        throw new NotFoundException(
          'No se encontraron taxes disponibles para este pais',
        );
      }
      return taxes;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const taxe = await this.descuentos_repo.findOne({
      where: { id },
      relations: ['pais'],
    });
    if (!taxe)
      throw new NotFoundException(`No se encontró impuesto con id ${id}`);
    return taxe;
  }

  async update(id: string, updateDescuentosPaiDto: UpdateDescuentosClienteDto) {
    const taxe = await this.findOne(id);

    if (updateDescuentosPaiDto.paisId) {
      const pais_exist = await this.paisRepo.findOne({
        where: { id: updateDescuentosPaiDto.paisId },
      });
      if (!pais_exist) {
        throw new NotFoundException('No se encontró el país seleccionado');
      }
      taxe.pais = pais_exist;
    }

    Object.assign(taxe, {
      nombre: updateDescuentosPaiDto.nombre ?? taxe.nombre,
      porcentaje: updateDescuentosPaiDto.porcentaje ?? taxe.porcentaje,
    });

    await this.descuentos_repo.save(taxe);
    return {
      message: 'Impuesto actualizado correctamente',
      taxe,
    };
  }
}
