import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { Inventario } from './entities/inventario.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Pai } from 'src/pais/entities/pai.entity';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,

    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,

    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
  ) {}

  async create(createInventarioDto: CreateInventarioDto) {
    try {
      const insumo = await this.insumoRepository.findOneBy({
        id: createInventarioDto.insumoId,
      });
      if (!insumo)
        throw new NotFoundException(
          `Insumo con ID ${createInventarioDto.insumoId} no encontrado`,
        );

      const insumo_exist_inventario = await this.inventarioRepository.findOne({
        where: { insumo: insumo },
      });
      if (insumo_exist_inventario)
        throw new BadRequestException(
          'Este insumo ya tiene un inventario establecido',
        );

      const inventario = this.inventarioRepository.create({
        insumo,
        cantidadDisponible: createInventarioDto.cantidadDisponible,
        stockMinimo: createInventarioDto.stockMinimo,
      });

      return this.inventarioRepository.save(inventario);
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, pais = '' } = paginationDto;

    try {
      const pais_exist = await this.paisRepository.findOne({
        where: { id: pais },
      });

      if (!pais_exist) {
        throw new NotFoundException('No se encontró el país seleccionado');
      }

      const [inventario, total] = await this.inventarioRepository.findAndCount({
        relations: ['insumo'],
        where: {
          insumo: {
            pais: { id: pais },
          },
        },
        skip: offset,
        take: limit,
      });

      if (!inventario || inventario.length === 0) {
        throw new NotFoundException(
          'No se encontró inventario en estos momentos',
        );
      }

      return { inventario, total };
    } catch (error) {
      throw error;
    }
  }

  async findInsumosDisponibles() {
    try {
      const insumos_disponibles = await this.inventarioRepository.find({
        where: { insumo: { disponible: true } },
      });
      if (!insumos_disponibles || insumos_disponibles.length === 0) {
        throw new NotFoundException(
          'No se encontraron insumos disponibles en este momento',
        );
      }
      return { insumos: insumos_disponibles };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const inventario = await this.inventarioRepository.findOne({
      where: { id },
      relations: ['insumo'],
    });
    if (!inventario)
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    return inventario;
  }

  async reducirCantidad(
    insumoId: string,
    cantidad: number,
  ): Promise<Inventario> {
    if (cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad a reducir debe ser mayor a cero',
      );
    }

    const inventario = await this.inventarioRepository.findOne({
      where: { insumo: { id: insumoId } },
      relations: ['insumo'],
    });

    if (!inventario) {
      throw new NotFoundException(
        `No se encontró inventario para el insumo con ID ${insumoId}`,
      );
    }

    if (inventario.cantidadDisponible < cantidad) {
      throw new BadRequestException(
        `No hay suficiente stock. Disponible: ${inventario.cantidadDisponible}, Solicitado: ${cantidad}`,
      );
    }

    inventario.cantidadDisponible -= cantidad;

    if (inventario.cantidadDisponible < inventario.stockMinimo) {
      console.warn(
        `¡Atención! Insumo ${inventario.insumo.nombre} por debajo del stock mínimo`,
      );
    }

    return this.inventarioRepository.save(inventario);
  }

  async aumentarCantidad(
    insumoId: string,
    cantidadUsada: number,
  ): Promise<Inventario> {
    if (cantidadUsada <= 0) {
      throw new BadRequestException(
        'La cantidad a aumentar debe ser mayor a cero',
      );
    }

    const inventario = await this.inventarioRepository.findOne({
      where: { insumo: { id: insumoId } },
      relations: ['insumo'],
    });

    if (!inventario) {
      throw new NotFoundException(
        `No se encontró inventario para el insumo con ID ${insumoId}`,
      );
    }

    inventario.cantidadDisponible += cantidadUsada;

    return this.inventarioRepository.save(inventario);
  }

  async update(id: string, updateInventarioDto: UpdateInventarioDto) {
    const inventario = await this.findOne(id);

    if (updateInventarioDto.insumoId) {
      const insumo = await this.insumoRepository.findOneBy({
        id: updateInventarioDto.insumoId,
      });
      if (!insumo)
        throw new NotFoundException(
          `insumo con ID ${updateInventarioDto.insumoId} no encontrado`,
        );
      inventario.insumo = insumo;
    }

    if (updateInventarioDto.cantidadDisponible !== undefined) {
      inventario.cantidadDisponible = updateInventarioDto.cantidadDisponible;
    }
    if (updateInventarioDto.stockMinimo !== undefined) {
      inventario.stockMinimo = updateInventarioDto.stockMinimo;
    }

    return this.inventarioRepository.save(inventario);
  }

  async remove(id: string): Promise<void> {
    const inventario = await this.findOne(id);
    await this.inventarioRepository.remove(inventario);
  }
}
