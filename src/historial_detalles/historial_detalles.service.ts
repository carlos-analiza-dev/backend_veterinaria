import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialDetalle } from './entities/historial_detalle.entity';
import { CreateHistorialDetalleDto } from './dto/create-historial_detalle.dto';
import { UpdateHistorialDetalleDto } from './dto/update-historial_detalle.dto';
import { HistorialClinico } from '../historial_clinico/entities/historial_clinico.entity';
import { Cita } from '../citas/entities/cita.entity';
import { SubServicio } from '../sub_servicios/entities/sub_servicio.entity';

@Injectable()
export class HistorialDetalleService {
  constructor(
    @InjectRepository(HistorialDetalle)
    private readonly historialDetalleRepository: Repository<HistorialDetalle>,
    @InjectRepository(HistorialClinico)
    private readonly historialClinicoRepository: Repository<HistorialClinico>,

    @InjectRepository(SubServicio)
    private readonly subServicioRepository: Repository<SubServicio>,
  ) {}

  async create(
    createHistorialDetalleDto: CreateHistorialDetalleDto,
  ): Promise<HistorialDetalle> {
    const { historialId, subServicioId, ...detalleData } =
      createHistorialDetalleDto;

    const historial = await this.historialClinicoRepository.findOne({
      where: { id: historialId },
    });
    if (!historial) {
      throw new NotFoundException(
        `Historial clínico con ID ${historialId} no encontrado`,
      );
    }

    let subServicio: SubServicio | undefined;
    if (subServicioId) {
      subServicio = await this.subServicioRepository.findOne({
        where: { id: subServicioId },
      });
      if (!subServicio) {
        throw new NotFoundException(
          `Subservicio con ID ${subServicioId} no encontrado`,
        );
      }
    }

    const detalle = this.historialDetalleRepository.create({
      ...detalleData,
      historial,

      subServicio,
    });

    return await this.historialDetalleRepository.save(detalle);
  }

  async findAll(): Promise<HistorialDetalle[]> {
    return await this.historialDetalleRepository.find({
      relations: ['historial', 'cita', 'subServicio', 'insumos', 'productos'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<HistorialDetalle> {
    const detalle = await this.historialDetalleRepository.findOne({
      where: { id },
      relations: ['historial', 'cita', 'subServicio', 'insumos', 'productos'],
    });

    if (!detalle) {
      throw new NotFoundException(
        `Detalle de historial con ID ${id} no encontrado`,
      );
    }

    return detalle;
  }

  async findByHistorial(historialId: string): Promise<HistorialDetalle[]> {
    return await this.historialDetalleRepository.find({
      where: { historial: { id: historialId } },
      relations: ['historial', 'cita', 'subServicio', 'insumos', 'productos'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(
    id: string,
    updateHistorialDetalleDto: UpdateHistorialDetalleDto,
  ): Promise<HistorialDetalle> {
    const detalle = await this.findOne(id);

    const { historialId, subServicioId, ...updateData } =
      updateHistorialDetalleDto;

    if (historialId && historialId !== detalle.historial.id) {
      const historial = await this.historialClinicoRepository.findOne({
        where: { id: historialId },
      });
      if (!historial) {
        throw new NotFoundException(
          `Historial clínico con ID ${historialId} no encontrado`,
        );
      }
      detalle.historial = historial;
    }

    if (subServicioId && subServicioId !== detalle.subServicio?.id) {
      const subServicio = await this.subServicioRepository.findOne({
        where: { id: subServicioId },
      });
      if (!subServicio) {
        throw new NotFoundException(
          `Subservicio con ID ${subServicioId} no encontrado`,
        );
      }
      detalle.subServicio = subServicio;
    }

    Object.assign(detalle, updateData);

    return await this.historialDetalleRepository.save(detalle);
  }

  async remove(id: string): Promise<void> {
    const detalle = await this.findOne(id);
    await this.historialDetalleRepository.remove(detalle);
  }
}
