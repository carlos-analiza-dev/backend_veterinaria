import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatosAgroservicio } from 'src/datos-agroservicio/entities/datos-agroservicio.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AgroservicioValidationService {
  constructor(
    @InjectRepository(DatosAgroservicio)
    private readonly agroRepo: Repository<DatosAgroservicio>,
  ) {}

  async obtenerAgroservicio(propietarioId: string): Promise<DatosAgroservicio> {
    const agroservicio = await this.agroRepo.findOne({
      where: { propietarioId },
    });

    if (!agroservicio) {
      throw new NotFoundException('No se encontró un agroservicio asociado.');
    }

    return agroservicio;
  }
}
