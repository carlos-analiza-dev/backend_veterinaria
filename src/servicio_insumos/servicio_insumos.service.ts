import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServicioInsumoDto } from './dto/create-servicio_insumo.dto';
import { UpdateServicioInsumoDto } from './dto/update-servicio_insumo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServicioInsumo } from './entities/servicio_insumo.entity';
import { Repository } from 'typeorm';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';

@Injectable()
export class ServicioInsumosService {
  constructor(
    @InjectRepository(ServicioInsumo)
    private readonly servicioInsumoRepo: Repository<ServicioInsumo>,

    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,

    @InjectRepository(SubServicio)
    private readonly subServicioRepo: Repository<SubServicio>,
  ) {}

  async create(createDto: CreateServicioInsumoDto): Promise<ServicioInsumo> {
    const { insumoId, servicioId, cantidad } = createDto;

    try {
      const relacionExistente = await this.servicioInsumoRepo.findOne({
        where: {
          insumoId,
          servicioId,
        },
      });

      if (relacionExistente) {
        throw new ConflictException(
          'Este insumo ya está asociado a este servicio',
        );
      }
      const insumo_exist = await this.insumoRepo.findOne({
        where: { id: insumoId },
      });
      if (!insumo_exist) {
        throw new BadRequestException('No se encontró el insumo seleccionado');
      }

      const servicio_exist = await this.subServicioRepo.findOne({
        where: { id: servicioId },
      });
      if (!servicio_exist) {
        throw new BadRequestException(
          'No se encontró el subservicio seleccionado',
        );
      }

      const nuevo = this.servicioInsumoRepo.create({
        insumoId,
        servicioId,
        cantidad: cantidad ?? 1,
      });

      return await this.servicioInsumoRepo.save(nuevo);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<ServicioInsumo[]> {
    return await this.servicioInsumoRepo.find({
      relations: ['insumo', 'servicio'],
    });
  }

  async findAllByServicio(id: string) {
    const servicio_exist = await this.subServicioRepo.findOne({
      where: { id },
    });
    if (!servicio_exist) {
      throw new BadRequestException(
        'No se encontró el subservicio seleccionado',
      );
    }
    return await this.servicioInsumoRepo.find({
      where: {
        servicioId: id,
      },
      relations: ['insumo', 'servicio'],
    });
  }

  async findOne(id: string): Promise<ServicioInsumo> {
    const servicioInsumo = await this.servicioInsumoRepo.findOne({
      where: { id },
      relations: ['insumo', 'servicio'],
    });

    if (!servicioInsumo) {
      throw new NotFoundException(`ServicioInsumo con id ${id} no encontrado`);
    }

    return servicioInsumo;
  }

  async update(
    id: string,
    updateDto: UpdateServicioInsumoDto,
  ): Promise<ServicioInsumo> {
    const servicioInsumo = await this.findOne(id);
    Object.assign(servicioInsumo, updateDto);
    return await this.servicioInsumoRepo.save(servicioInsumo);
  }
}
