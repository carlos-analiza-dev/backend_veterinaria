import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubServicioDto } from './dto/create-sub_servicio.dto';
import { UpdateSubServicioDto } from './dto/update-sub_servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubServicio, TipoSubServicio } from './entities/sub_servicio.entity';
import { Repository } from 'typeorm';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class SubServiciosService {
  constructor(
    @InjectRepository(SubServicio)
    private readonly sub_servicio_repo: Repository<SubServicio>,
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    @InjectRepository(ServiciosPai)
    private readonly servicio_precio_Repo: Repository<ServiciosPai>,
  ) {}
  async create(createSubServicioDto: CreateSubServicioDto) {
    const {
      nombre,
      descripcion,
      servicioId,
      isActive,
      disponible,
      tipo,
      unidad_venta,
      paisId,
      cantidadMax,
      cantidadMin,
      precio,
      tiempo,
    } = createSubServicioDto;

    try {
      let servicio_existe;
      if (tipo === TipoSubServicio.SERVICIO) {
        servicio_existe = await this.servicioRepo.findOne({
          where: { id: servicioId },
        });
        if (!servicio_existe)
          throw new NotFoundException(
            'No se encontró el servicio seleccionado',
          );
      }

      const codigoPrefix = tipo === TipoSubServicio.PRODUCTO ? 'PROD' : 'SERV';
      const codigo = `${codigoPrefix}-${randomBytes(3)
        .toString('hex')
        .toUpperCase()}`;

      const sub_Servicio = this.sub_servicio_repo.create({
        nombre,
        descripcion,
        isActive,
        codigo,
        disponible,
        tipo,
        unidad_venta,
        servicio: servicio_existe,
      });

      const subServicioGuardado = await this.sub_servicio_repo.save(
        sub_Servicio,
      );

      const pais = await this.paisRepo.findOne({ where: { id: paisId } });
      if (!pais) {
        throw new NotFoundException('No se encontró el país seleccionado');
      }

      const precioPorPaisData: any = {
        subServicio: subServicioGuardado,
        pais,
        precio,
      };

      if (tipo === TipoSubServicio.SERVICIO) {
        precioPorPaisData.tiempo = tiempo;
        precioPorPaisData.cantidadMin = cantidadMin ?? 1;
        precioPorPaisData.cantidadMax = cantidadMax;
      }

      const precioPorPais = this.servicio_precio_Repo.create(precioPorPaisData);
      await this.servicio_precio_Repo.save(precioPorPais);

      return 'Sub-servicio creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll(servicioId: string) {
    try {
      const servicio = await this.servicioRepo.findOne({
        where: { id: servicioId },
      });
      if (!servicio)
        throw new NotFoundException('No se encontro el servicio seleccionado');
      const sub_servicios = await this.sub_servicio_repo.find({
        where: {
          servicio,
        },
      });
      if (!sub_servicios || sub_servicios.length === 0) {
        throw new BadRequestException(
          'No se encontraron sub_servicios disponibles',
        );
      }
      return sub_servicios;
    } catch (error) {
      throw error;
    }
  }

  async findAllPreciosCantidadAnimales(
    servicioId: string,
    paisId: string,
    cantidadAnimales?: number,
  ) {
    const pais = await this.paisRepo.findOne({
      where: { id: paisId },
    });
    if (!pais) {
      throw new NotFoundException('No se encontró el país seleccionado');
    }

    const subServicio = await this.sub_servicio_repo.findOne({
      where: { id: servicioId },
      relations: ['preciosPorPais', 'preciosPorPais.pais'],
    });

    if (!subServicio) {
      throw new NotFoundException('No se encontró el servicio seleccionado');
    }

    subServicio.preciosPorPais = subServicio.preciosPorPais.filter(
      (precio) => precio.pais.id === paisId,
    );

    if (subServicio.preciosPorPais.length === 0) {
      throw new BadRequestException(
        'No se encontraron precios configurados para este servicio en el país seleccionado',
      );
    }

    if (cantidadAnimales !== undefined) {
      subServicio.preciosPorPais = subServicio.preciosPorPais.filter(
        (precio) => {
          const min = precio.cantidadMin ?? 0;
          const max = precio.cantidadMax ?? Infinity;
          return cantidadAnimales >= min && cantidadAnimales <= max;
        },
      );

      if (subServicio.preciosPorPais.length === 0) {
        throw new BadRequestException(
          'No se encontraron precios para la cantidad de animales especificada',
        );
      }
    }

    if (cantidadAnimales !== undefined) {
      return subServicio;
    }

    return subServicio;
  }

  async findOne(id: string) {
    try {
      const sub_servicio = await this.sub_servicio_repo.findOne({
        where: {
          id,
        },
      });
      if (!sub_servicio) {
        throw new NotFoundException(
          'No se encontro el subservicio seleccionado',
        );
      }
      return sub_servicio;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateSubServicioDto: UpdateSubServicioDto) {
    const { nombre, descripcion, isActive, servicioId } = updateSubServicioDto;

    try {
      const sub_servicio = await this.sub_servicio_repo.findOne({
        where: { id },
      });

      if (!sub_servicio) {
        throw new NotFoundException(
          'No se encontró el subservicio que desea actualizar',
        );
      }

      if (servicioId) {
        const servicio = await this.servicioRepo.findOne({
          where: { id: servicioId },
        });
        if (!servicio) {
          throw new NotFoundException('No se encontró el servicio relacionado');
        }
        sub_servicio.servicio = servicio;
      }

      if (nombre !== undefined) sub_servicio.nombre = nombre;
      if (descripcion !== undefined) sub_servicio.descripcion = descripcion;
      if (isActive !== undefined) sub_servicio.isActive = isActive;

      await this.sub_servicio_repo.save(sub_servicio);

      return {
        message: 'Subservicio actualizado correctamente',
        data: sub_servicio,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} subServicio`;
  }
}
