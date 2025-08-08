import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCitaInsumoDto } from './dto/create-cita_insumo.dto';
import { UpdateCitaInsumoDto } from './dto/update-cita_insumo.dto';
import { CitaInsumo } from './entities/cita_insumo.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { Inventario } from 'src/inventario/entities/inventario.entity';
import { CitaInsumoResponseDto } from './dto/cita-insumo-response.dto';

@Injectable()
export class CitaInsumosService {
  constructor(
    @InjectRepository(CitaInsumo)
    private readonly citaInsumoRepository: Repository<CitaInsumo>,
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
  ) {}

  async create(createCitaInsumoDto: CreateCitaInsumoDto) {
    const cita = await this.citaRepository.findOne({
      where: { id: createCitaInsumoDto.citaId },
    });
    if (!cita) {
      throw new NotFoundException(
        `Cita con ID ${createCitaInsumoDto.citaId} no encontrada`,
      );
    }

    const insumo = await this.insumoRepository.findOne({
      where: { id: createCitaInsumoDto.insumoId },
      relations: ['inventario'],
    });
    if (!insumo) {
      throw new NotFoundException(
        `Insumo con ID ${createCitaInsumoDto.insumoId} no encontrado`,
      );
    }

    if (
      !insumo.inventario ||
      insumo.inventario.cantidadDisponible < createCitaInsumoDto.cantidad
    ) {
      throw new NotFoundException(
        `No hay suficiente stock del insumo ${insumo.nombre}`,
      );
    }

    const citaInsumo = this.citaInsumoRepository.create({
      cita: { id: createCitaInsumoDto.citaId },
      insumo: { id: createCitaInsumoDto.insumoId },
      cantidad: createCitaInsumoDto.cantidad,
      precioUnitario: createCitaInsumoDto.precioUnitario,
    });

    await this.inventarioRepository.decrement(
      { id: insumo.inventario.id },
      'cantidadDisponible',
      createCitaInsumoDto.cantidad,
    );

    const saved = await this.citaInsumoRepository.save(citaInsumo);
    return this.mapToResponseDto(saved);
  }

  async findAllByCita(citaId: string) {
    const citaInsumos = await this.citaInsumoRepository.find({
      where: { cita: { id: citaId } },
      relations: ['insumo'],
    });

    return citaInsumos.map((ci) => this.mapToResponseDto(ci));
  }

  async findOne(id: string) {
    const citaInsumo = await this.citaInsumoRepository.findOne({
      where: { id },
      relations: ['insumo'],
    });

    if (!citaInsumo) {
      throw new NotFoundException(`CitaInsumo con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(citaInsumo);
  }

  async update(id: string, updateCitaInsumoDto: UpdateCitaInsumoDto) {
    const citaInsumo = await this.citaInsumoRepository.findOne({
      where: { id },
      relations: ['insumo', 'insumo.inventario'],
    });

    if (!citaInsumo) {
      throw new NotFoundException(`CitaInsumo con ID ${id} no encontrado`);
    }

    if (updateCitaInsumoDto.cantidad !== undefined) {
      const diferencia = updateCitaInsumoDto.cantidad - citaInsumo.cantidad;
      await this.inventarioRepository.manager.transaction(async (manager) => {
        await manager.decrement(
          Inventario,
          { id: citaInsumo.insumo.inventario.id },
          'cantidadDisponible',
          diferencia,
        );
      });
    }

    const updated = await this.citaInsumoRepository.save({
      ...citaInsumo,
      ...updateCitaInsumoDto,
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string) {
    const citaInsumo = await this.citaInsumoRepository.findOne({
      where: { id },
      relations: ['insumo', 'insumo.inventario'],
    });

    if (!citaInsumo) {
      throw new NotFoundException(`CitaInsumo con ID ${id} no encontrado`);
    }

    await this.inventarioRepository.increment(
      { id: citaInsumo.insumo.inventario.id },
      'cantidadDisponible',
      citaInsumo.cantidad,
    );

    await this.citaInsumoRepository.delete(id);
    return { message: 'CitaInsumo eliminado correctamente' };
  }

  private mapToResponseDto(citaInsumo: CitaInsumo): CitaInsumoResponseDto {
    return {
      id: citaInsumo.id,
      citaId: citaInsumo.cita.id,
      insumoId: citaInsumo.insumo.id,
      insumoNombre: citaInsumo.insumo.nombre,
      cantidad: citaInsumo.cantidad,
      precioUnitario: citaInsumo.precioUnitario,
      subtotal: citaInsumo.cantidad * citaInsumo.precioUnitario,
    };
  }
}
