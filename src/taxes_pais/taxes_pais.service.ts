import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaxesPaiDto } from './dto/create-taxes_pai.dto';
import { UpdateTaxesPaiDto } from './dto/update-taxes_pai.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaxesPai } from './entities/taxes_pai.entity';
import { Repository } from 'typeorm';
import { Pai } from 'src/pais/entities/pai.entity';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class TaxesPaisService {
  constructor(
    @InjectRepository(TaxesPai)
    private readonly taxes_repo: Repository<TaxesPai>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
  ) {}

  async create(createTaxesPaiDto: CreateTaxesPaiDto) {
    const { nombre, paisId, porcentaje } = createTaxesPaiDto;
    const pais_exist = await this.paisRepo.findOne({ where: { id: paisId } });

    if (!pais_exist) {
      throw new NotFoundException('No se encontró el país seleccionado');
    }

    const taxe = this.taxes_repo.create({
      nombre,
      porcentaje,
      pais: pais_exist,
    });
    await this.taxes_repo.save(taxe);

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
      const taxes = await this.taxes_repo.find({
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
    const taxe = await this.taxes_repo.findOne({
      where: { id },
      relations: ['pais'],
    });
    if (!taxe)
      throw new NotFoundException(`No se encontró impuesto con id ${id}`);
    return taxe;
  }

  async update(id: string, updateTaxesPaiDto: UpdateTaxesPaiDto) {
    const taxe = await this.findOne(id);

    if (updateTaxesPaiDto.paisId) {
      const pais_exist = await this.paisRepo.findOne({
        where: { id: updateTaxesPaiDto.paisId },
      });
      if (!pais_exist) {
        throw new NotFoundException('No se encontró el país seleccionado');
      }
      taxe.pais = pais_exist;
    }

    Object.assign(taxe, {
      nombre: updateTaxesPaiDto.nombre ?? taxe.nombre,
      porcentaje: updateTaxesPaiDto.porcentaje ?? taxe.porcentaje,
    });

    await this.taxes_repo.save(taxe);
    return {
      message: 'Impuesto actualizado correctamente',
      taxe,
    };
  }
}
