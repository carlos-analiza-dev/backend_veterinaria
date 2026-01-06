import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateServiciosPaiDto } from './dto/create-servicios_pai.dto';
import { UpdateServiciosPaiDto } from './dto/update-servicios_pai.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiciosPai } from './entities/servicios_pai.entity';
import { Repository } from 'typeorm';
import { Pai } from 'src/pais/entities/pai.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { SubServicio } from 'src/sub_servicios/entities/sub_servicio.entity';
import { ServicioInsumo } from 'src/servicio_insumos/entities/servicio_insumo.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Injectable()
export class ServiciosPaisService {
  constructor(
    @InjectRepository(ServiciosPai)
    private readonly servicio_percios_Repo: Repository<ServiciosPai>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    @InjectRepository(SubServicio)
    private readonly subservicioRepo: Repository<SubServicio>,
    @InjectRepository(ServicioInsumo)
    private readonly servicioInsumoRepo: Repository<ServicioInsumo>,
    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,
  ) {}

  async create(createServiciosPaiDto: CreateServiciosPaiDto) {
    const {
      sub_servicio_id,
      paisId,
      precio,
      tiempo,
      costo,
      cantidadMin,
      cantidadMax,
      insumos,
    } = createServiciosPaiDto;

    try {
      const pais_exist = await this.paisRepo.findOne({ where: { id: paisId } });
      if (!pais_exist) {
        throw new NotFoundException(
          'El país seleccionado no se encuentra en la base de datos.',
        );
      }

      const servicio_exist = await this.subservicioRepo.findOne({
        where: { id: sub_servicio_id },
      });
      if (!servicio_exist) {
        throw new NotFoundException(
          'El subservicio seleccionado no se encuentra en la base de datos.',
        );
      }

      const servicioPaisExistente = await this.servicio_percios_Repo.findOne({
        where: {
          subServicio: { id: sub_servicio_id },
          pais: { id: paisId },
        },
      });

      if (servicioPaisExistente) {
        throw new BadRequestException(
          'Ya existe un precio configurado para este servicio en el país seleccionado.',
        );
      }

      const costoFinal =
        costo === null || costo === undefined || costo === 0 ? precio : costo;

      const servicioPais = this.servicio_percios_Repo.create({
        pais: pais_exist,
        subServicio: servicio_exist,
        precio,
        costo: costoFinal,
        tiempo,
        cantidadMin,
        cantidadMax,
      });

      const servicioPaisGuardado = await this.servicio_percios_Repo.save(
        servicioPais,
      );

      if (insumos && insumos.length > 0) {
        await this.procesarInsumos(servicioPaisGuardado.id, insumos);
      }

      return {
        message: 'Servicio creado exitosamente',
        id: servicioPaisGuardado.id,
        insumosAgregados: insumos?.length || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  private async procesarInsumos(servicioPaisId: string, insumos: any[]) {
    const servicioPaisExist = await this.servicio_percios_Repo.findOne({
      where: { id: servicioPaisId },
    });

    if (!servicioPaisExist) {
      throw new NotFoundException(
        `No se encontró el servicio-país con id ${servicioPaisId}`,
      );
    }

    await this.servicioInsumoRepo.delete({ servicioPaisId });

    if (!insumos || insumos.length === 0) {
      return [];
    }

    const insumosCreados = [];

    for (const insumoDto of insumos) {
      try {
        const insumo_exist = await this.insumoRepo.findOne({
          where: { id: insumoDto.insumoId },
        });

        if (!insumo_exist) {
          throw new BadRequestException(
            `El insumo con id ${insumoDto.insumoId} no existe.`,
          );
        }

        const servicioInsumo = this.servicioInsumoRepo.create({
          servicioPaisId,
          insumoId: insumoDto.insumoId,
          cantidad: insumoDto.cantidad || 1,
        });

        const servicioInsumoGuardado = await this.servicioInsumoRepo.save(
          servicioInsumo,
        );
        insumosCreados.push(servicioInsumoGuardado);
      } catch (error) {
        throw new BadRequestException(
          `Error al procesar insumos: ${error.message}`,
        );
      }
    }

    return insumosCreados;
  }

  async findAll(servicioId: string, paginationDto: PaginationDto) {
    try {
      const servicio = await this.subservicioRepo.findOne({
        where: { id: servicioId },
      });
      if (!servicio)
        throw new NotFoundException('No se encontro el servicio seleccionado.');

      const servicios_pais_detalle = await this.servicio_percios_Repo.find({
        where: { subServicio: servicio },
        relations: ['pais', 'insumos', 'insumos.insumo'],
      });
      return servicios_pais_detalle;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const servicioPais = await this.servicio_percios_Repo.findOne({
      where: { id },
      relations: ['pais', 'subServicio', 'insumos', 'insumos.insumo'],
    });

    if (!servicioPais) {
      throw new NotFoundException(
        `No se encontró el servicio-país con id ${id}`,
      );
    }

    return servicioPais;
  }

  async update(id: string, updateServiciosPaiDto: UpdateServiciosPaiDto) {
    const servicio = await this.servicio_percios_Repo.findOne({
      where: { id },
      relations: ['pais', 'subServicio'],
    });

    if (!servicio) {
      throw new NotFoundException(`No se encontró el servicio con id ${id}`);
    }

    const { paisId, precio, tiempo, cantidadMin, cantidadMax, costo, insumos } =
      updateServiciosPaiDto;

    if (cantidadMin !== undefined && cantidadMax !== undefined) {
      if (cantidadMin >= cantidadMax) {
        throw new BadRequestException(
          'La cantidad mínima debe ser menor que la cantidad máxima',
        );
      }
    }

    if (tiempo !== undefined && tiempo <= 0) {
      throw new BadRequestException('El tiempo debe ser mayor a 0');
    }

    if (precio !== undefined && precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    if (paisId) {
      const pais_exist = await this.paisRepo.findOne({ where: { id: paisId } });
      if (!pais_exist) {
        throw new NotFoundException(`El país con id ${paisId} no existe.`);
      }
      servicio.pais = pais_exist;
    }

    if (precio !== undefined) {
      servicio.precio = precio;

      if (costo === undefined) {
        servicio.costo = precio;
      }
    }

    if (costo !== undefined) {
      if (costo === null || costo === 0) {
        servicio.costo = servicio.precio;
      } else {
        servicio.costo = costo;
      }
    }

    if (tiempo !== undefined) servicio.tiempo = tiempo;
    if (cantidadMin !== undefined) servicio.cantidadMin = cantidadMin;
    if (cantidadMax !== undefined) servicio.cantidadMax = cantidadMax;

    await this.servicio_percios_Repo.save(servicio);

    if (insumos !== undefined) {
      await this.procesarInsumos(id, insumos);
    }

    return {
      message: 'Servicio actualizado exitosamente',
      id: servicio.id,
    };
  }

  async remove(id: string) {
    const servicioPais = await this.servicio_percios_Repo.findOne({
      where: { id },
    });

    if (!servicioPais) {
      throw new NotFoundException(
        `No se encontró el servicio-país con id ${id}`,
      );
    }

    await this.servicio_percios_Repo.remove(servicioPais);

    return { message: 'Servicio-país eliminado exitosamente' };
  }

  async agregarInsumo(servicioPaisId: string, insumoDto: any) {
    const servicioPais = await this.servicio_percios_Repo.findOne({
      where: { id: servicioPaisId },
    });

    if (!servicioPais) {
      throw new NotFoundException(
        `No se encontró el servicio-país con id ${servicioPaisId}`,
      );
    }

    return await this.procesarInsumos(servicioPaisId, [insumoDto]);
  }

  async obtenerInsumos(servicioPaisId: string) {
    const servicioPais = await this.servicio_percios_Repo.findOne({
      where: { id: servicioPaisId },
      relations: ['insumos', 'insumos.insumo'],
    });

    if (!servicioPais) {
      throw new NotFoundException(
        `No se encontró el servicio-país con id ${servicioPaisId}`,
      );
    }

    return servicioPais.insumos;
  }
}
