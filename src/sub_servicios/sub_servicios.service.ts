import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
import { PaginationDto } from 'src/common/dto/pagination-common.dto';

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
      isActive = true,
      disponible = true,
      tipo = TipoSubServicio.SERVICIO,
      unidad_venta,
    } = createSubServicioDto;

    try {
      const nombreExistente = await this.sub_servicio_repo.findOne({
        where: { nombre },
      });

      if (nombreExistente) {
        throw new ConflictException('Ya existe un servicio con este nombre');
      }

      let servicio_existe = null;

      if (tipo === TipoSubServicio.SERVICIO) {
        if (!servicioId) {
          throw new NotFoundException(
            'El ID del servicio es requerido para servicios',
          );
        }

        servicio_existe = await this.servicioRepo.findOne({
          where: { id: servicioId, isActive: true },
        });

        if (!servicio_existe) {
          throw new NotFoundException(
            'No se encontró el servicio seleccionado o está inactivo',
          );
        }
      } else if (servicioId) {
        throw new ConflictException(
          'Los productos no pueden estar asociados a un servicio',
        );
      }

      const codigoPrefix = tipo === TipoSubServicio.PRODUCTO ? 'PROD' : 'SERV';
      let codigo: string;
      let codigoUnico = false;
      let intentos = 0;

      while (!codigoUnico && intentos < 5) {
        codigo = `${codigoPrefix}-${randomBytes(3)
          .toString('hex')
          .toUpperCase()}`;

        const codigoExistente = await this.sub_servicio_repo.findOne({
          where: { codigo },
        });

        if (!codigoExistente) {
          codigoUnico = true;
        }
        intentos++;
      }

      if (!codigoUnico) {
        throw new InternalServerErrorException('Error generando código único');
      }

      const subServicio = this.sub_servicio_repo.create({
        nombre,
        descripcion,
        isActive,
        codigo,
        disponible,
        tipo,
        unidad_venta,
        servicio: servicio_existe,
      });

      await this.sub_servicio_repo.save(subServicio);

      return 'servicio creado exitosamente';
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Error creando sub-servicio:', error);

      throw new InternalServerErrorException(
        'Error interno del servidor al crear el servicio',
      );
    }
  }

  async findAllProductos(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const [servicios, total] = await this.sub_servicio_repo.findAndCount({
        where: {
          tipo: TipoSubServicio.PRODUCTO,
          isActive: true,
        },
        relations: ['servicio'],
        order: {
          createdAt: 'DESC',
        },
        take: limit,
        skip: offset,
      });

      if (!servicios || servicios.length === 0) {
        throw new BadRequestException(
          'No se encontraron productos disponibles',
        );
      }

      return {
        servicios,
        total,
      };
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
    const {
      nombre,
      descripcion,
      isActive,
      servicioId,
      disponible,
      tipo,
      unidad_venta,
    } = updateSubServicioDto;

    try {
      const sub_servicio = await this.sub_servicio_repo.findOne({
        where: { id },
        relations: ['servicio'],
      });

      if (!sub_servicio) {
        throw new NotFoundException(
          'No se encontró el subservicio que desea actualizar',
        );
      }

      if (nombre && nombre !== sub_servicio.nombre) {
        const nombreExistente = await this.sub_servicio_repo.findOne({
          where: { nombre },
        });

        if (nombreExistente && nombreExistente.id !== id) {
          throw new ConflictException(
            'Ya existe otro sub-servicio con este nombre',
          );
        }
        sub_servicio.nombre = nombre;
      }

      if (tipo !== undefined && tipo !== sub_servicio.tipo) {
        if (tipo === TipoSubServicio.SERVICIO) {
          if (!servicioId && !sub_servicio.servicio) {
            throw new BadRequestException(
              'El ID del servicio es requerido al cambiar a tipo SERVICIO',
            );
          }
        } else {
          sub_servicio.servicio = null;
        }
        sub_servicio.tipo = tipo;
      }

      if (servicioId !== undefined) {
        if (sub_servicio.tipo === TipoSubServicio.SERVICIO) {
          const servicio = await this.servicioRepo.findOne({
            where: { id: servicioId, isActive: true },
          });

          if (!servicio) {
            throw new NotFoundException(
              'No se encontró el servicio relacionado o está inactivo',
            );
          }
          sub_servicio.servicio = servicio;
        } else {
          throw new BadRequestException(
            'No se puede asignar un servicio a un producto',
          );
        }
      }

      if (unidad_venta !== undefined) {
        if (sub_servicio.tipo === TipoSubServicio.PRODUCTO && !unidad_venta) {
          throw new BadRequestException(
            'La unidad de venta es requerida para productos',
          );
        }
        sub_servicio.unidad_venta = unidad_venta;
      }

      if (descripcion !== undefined) sub_servicio.descripcion = descripcion;
      if (isActive !== undefined) sub_servicio.isActive = isActive;
      if (disponible !== undefined) sub_servicio.disponible = disponible;

      if (isActive === false && disponible === true) {
        throw new BadRequestException(
          'No se puede tener un sub-servicio inactivo pero disponible',
        );
      }

      const subServicioActualizado = await this.sub_servicio_repo.save(
        sub_servicio,
      );

      const subServicioCompleto = await this.sub_servicio_repo.findOne({
        where: { id },
        relations: ['servicio'],
      });

      return {
        message: 'Subservicio actualizado correctamente',
        data: subServicioCompleto,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} subServicio`;
  }
}
