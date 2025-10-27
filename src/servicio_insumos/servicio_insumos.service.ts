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
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';

@Injectable()
export class ServicioInsumosService {
  constructor(
    @InjectRepository(ServicioInsumo)
    private readonly servicioInsumoRepo: Repository<ServicioInsumo>,

    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,

    @InjectRepository(ServiciosPai)
    private readonly servicioPaisRepo: Repository<ServiciosPai>,
  ) {}

  async create(createDto: CreateServicioInsumoDto): Promise<ServicioInsumo> {
    const { insumoId, servicioPaisId, cantidad } = createDto;

    try {
      const relacionExistente = await this.servicioInsumoRepo.findOne({
        where: { insumoId, servicioPaisId },
      });

      if (relacionExistente) {
        throw new ConflictException(
          'Este insumo ya está asociado a este servicio por país',
        );
      }

      const insumoExist = await this.insumoRepo.findOne({
        where: { id: insumoId },
      });
      if (!insumoExist) {
        throw new BadRequestException('No se encontró el insumo seleccionado');
      }

      const servicioPaisExist = await this.servicioPaisRepo.findOne({
        where: { id: servicioPaisId },
      });
      if (!servicioPaisExist) {
        throw new BadRequestException(
          'No se encontró el servicio por país seleccionado',
        );
      }

      const nuevo = this.servicioInsumoRepo.create({
        insumoId,
        servicioPaisId,
        cantidad: cantidad ?? 1,
      });

      return await this.servicioInsumoRepo.save(nuevo);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<ServicioInsumo[]> {
    return await this.servicioInsumoRepo.find({
      relations: ['insumo', 'servicioPais'],
    });
  }

  async findAllByServicio(id: string) {
    const servicioPaisExist = await this.servicioPaisRepo.findOne({
      where: { id },
    });
    if (!servicioPaisExist) {
      throw new BadRequestException(
        'No se encontró el servicio por país seleccionado',
      );
    }

    return await this.servicioInsumoRepo.find({
      where: { servicioPaisId: id },
      relations: ['insumo', 'servicioPais'],
    });
  }

  async findOne(id: string): Promise<ServicioInsumo> {
    const servicioInsumo = await this.servicioInsumoRepo.findOne({
      where: { id },
      relations: ['insumo', 'servicioPais'],
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
