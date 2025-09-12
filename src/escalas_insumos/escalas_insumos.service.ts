import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEscalasInsumoDto } from './dto/create-escalas_insumo.dto';
import { UpdateEscalasInsumoDto } from './dto/update-escalas_insumo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscalasInsumo } from './entities/escalas_insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

@Injectable()
export class EscalasInsumosService {
  constructor(
    @InjectRepository(EscalasInsumo)
    private readonly escalasRepo: Repository<EscalasInsumo>,
    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
  ) {}

  async create(createEscalasInsumoDto: CreateEscalasInsumoDto) {
    const {
      cantidad_comprada,
      costo,
      bonificacion,
      insumoId,
      proveedorId,
      paisId,
      isActive,
    } = createEscalasInsumoDto;
    try {
      const insumo_existe = await this.insumoRepo.findOne({
        where: { id: insumoId },
      });
      if (!insumo_existe)
        throw new NotFoundException('No se encontro el insumo seleccionado');

      const proveedor_existe = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
      });
      if (!proveedor_existe)
        throw new NotFoundException('No se encontro el proveedor seleccionado');

      const pais_existe = await this.paisRepository.findOne({
        where: { id: paisId },
      });
      if (!pais_existe)
        throw new NotFoundException('No se encontro el pais seleccionado');

      const escala = this.escalasRepo.create({
        cantidad_comprada,
        bonificacion,
        costo,
        isActive,
        insumo: insumo_existe,
        pais: pais_existe,
        proveedor: proveedor_existe,
      });
      await this.escalasRepo.save(escala);
      return 'Escala del insumo creada exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const escalas = await this.escalasRepo.find({
        relations: ['insumo'],
        order: { cantidad_comprada: 'ASC' },
      });
      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async findByInsumo(paginationDto: PaginationDto, insumoId: string) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const [escalas, total] = await this.escalasRepo.findAndCount({
        where: { insumo: { id: insumoId } },
        relations: ['insumo', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
        take: limit,
        skip: offset,
      });

      if (!escalas || escalas.length === 0) {
        throw new NotFoundException(
          `No se encontraron escalas para el insumo con ID ${insumoId}`,
        );
      }

      return {
        data: escalas,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async findByProveedorAndInsumo(proveedorId: string, insumoId: string) {
    try {
      const [proveedor, insumo] = await Promise.all([
        this.proveedorRepository.findOne({ where: { id: proveedorId } }),
        this.insumoRepo.findOne({ where: { id: insumoId } }),
      ]);

      if (!proveedor) {
        throw new NotFoundException('No se encontró el proveedor seleccionado');
      }

      if (!insumo) {
        throw new NotFoundException('No se encontró el insumo seleccionado');
      }

      const escalas = await this.escalasRepo.find({
        where: {
          proveedor: { id: proveedorId },
          insumo: { id: insumoId },
          isActive: true,
        },
        relations: ['insumo', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (escalas.length === 0) {
        throw new NotFoundException(
          'No se encontraron escalas para esta combinación de proveedor e insumo',
        );
      }

      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async findByInsumoEscalas(insumoId: string) {
    try {
      const escalas = await this.escalasRepo.find({
        where: { insumo: { id: insumoId } },
        relations: ['insumo', 'proveedor', 'pais'],
        order: { cantidad_comprada: 'ASC' },
      });

      if (!escalas || escalas.length === 0) {
        throw new NotFoundException(
          `No se encontraron escalas para el insumo con ID ${insumoId}`,
        );
      }

      return escalas;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateEscalasInsumoDto: UpdateEscalasInsumoDto) {
    try {
      const escala = await this.escalasRepo.findOne({
        where: { id },
      });

      if (!escala) {
        throw new NotFoundException(`Escala con ID ${id} no encontrada`);
      }

      if (updateEscalasInsumoDto.insumoId) {
        const insumo_existe = await this.insumoRepo.findOne({
          where: { id: updateEscalasInsumoDto.insumoId },
        });
        if (!insumo_existe) {
          throw new NotFoundException('No se encontró el insumo seleccionado');
        }
      }

      await this.escalasRepo.update(id, updateEscalasInsumoDto);

      const escalaActualizada = await this.escalasRepo.findOne({
        where: { id },
        relations: ['inaumo'],
      });

      return {
        message: 'Escala actualizada exitosamente',
        data: escalaActualizada,
      };
    } catch (error) {
      throw error;
    }
  }
}
