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
import { randomBytes } from 'crypto';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { ServiciosPai } from 'src/servicios_pais/entities/servicios_pai.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class SubServiciosService {
  constructor(
    @InjectRepository(SubServicio)
    private readonly sub_servicio_repo: Repository<SubServicio>,
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(Pai)
    private readonly paisRepo: Repository<Pai>,
    @InjectRepository(Marca)
    private readonly marcaRepo: Repository<Marca>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(ServiciosPai)
    private readonly serviciosPaiRepo: Repository<ServiciosPai>,
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
      marcaId,
      proveedorId,
      categoriaId,
      atributos,
      codigo_barra,
      tax_rate,
      precio,
      costo,
      paisId,
    } = createSubServicioDto;

    try {
      this.validateProductRelations(createSubServicioDto);

      let servicio_existe = null;
      let marca = null;
      let proveedor = null;
      let categoria = null;
      let pais = null;

      if (tipo === TipoSubServicio.PRODUCTO) {
        if (!paisId) {
          throw new BadRequestException(
            'Los productos deben tener un país asociado para el precio',
          );
        }

        pais = await this.paisRepo.findOne({
          where: { id: paisId, isActive: true },
        });

        if (!pais) {
          throw new NotFoundException('País no encontrado o inactivo');
        }

        if (!precio || precio <= 0) {
          throw new BadRequestException(
            'Los productos deben tener un precio válido mayor a 0',
          );
        }

        if (!costo || costo <= 0) {
          throw new BadRequestException(
            'Los productos deben tener un costo válido mayor a 0',
          );
        }
      }

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
      } else if (tipo === TipoSubServicio.PRODUCTO) {
        if (servicioId) {
          throw new ConflictException(
            'Los productos no pueden estar asociados a un servicio',
          );
        }

        if (!marcaId) {
          throw new BadRequestException(
            'Los productos deben tener una marca asociada',
          );
        }
        marca = await this.marcaRepo.findOne({
          where: { id: marcaId, is_active: true },
        });
        if (!marca) {
          throw new NotFoundException('Marca no encontrada o inactiva');
        }

        if (!proveedorId) {
          throw new BadRequestException(
            'Los productos deben tener un proveedor asociado',
          );
        }
        proveedor = await this.proveedorRepo.findOne({
          where: { id: proveedorId, is_active: true },
        });
        if (!proveedor) {
          throw new NotFoundException('Proveedor no encontrado o inactivo');
        }

        if (!categoriaId) {
          throw new BadRequestException(
            'Los productos deben tener una categoría asociada',
          );
        }
        categoria = await this.categoriaRepo.findOne({
          where: { id: categoriaId, is_active: true },
        });
        if (!categoria) {
          throw new NotFoundException('Categoría no encontrada o inactiva');
        }
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
        marca,
        proveedor,
        categoria,
        ...(tipo === TipoSubServicio.PRODUCTO && {
          codigo_barra,
          atributos,
          tax_rate,
        }),
      });

      await this.sub_servicio_repo.save(subServicio);

      if (tipo === TipoSubServicio.PRODUCTO) {
        const servicioPai = this.serviciosPaiRepo.create({
          subServicio,
          pais,
          precio,
          costo,
          tiempo: null,
          cantidadMin: null,
          cantidadMax: null,
        });

        await this.serviciosPaiRepo.save(servicioPai);
      }

      return 'servicio creado exitosamente';
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno del servidor al crear el servicio',
      );
    }
  }
  private validateProductRelations(
    dto: CreateSubServicioDto | UpdateSubServicioDto,
  ): void {
    if (dto.tipo === TipoSubServicio.PRODUCTO) {
      if (!dto.marcaId) {
        throw new BadRequestException(
          'Los productos deben tener una marca asociada',
        );
      }
      if (!dto.proveedorId) {
        throw new BadRequestException(
          'Los productos deben tener un proveedor asociado',
        );
      }
      if (!dto.categoriaId) {
        throw new BadRequestException(
          'Los productos deben tener una categoria asociado',
        );
      }
      if (!dto.codigo_barra) {
        throw new BadRequestException(
          'Los productos deben tener un codigo de barra asociado',
        );
      }
      if (!dto.atributos) {
        throw new BadRequestException(
          'Los productos deben tener atributos asociado',
        );
      }
      if (!dto.tax_rate) {
        throw new BadRequestException(
          'Los productos deben tener taxes asociado',
        );
      }
    } else if (dto.tipo === TipoSubServicio.SERVICIO) {
      if (dto.marcaId) {
        throw new BadRequestException(
          'Los servicios no pueden tener marca asociada',
        );
      }
      if (dto.proveedorId) {
        throw new BadRequestException(
          'Los servicios no pueden tener proveedor asociado',
        );
      }
    }
  }

  async findAllProductos(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, pais = '' } = paginationDto;

    try {
      const whereConditions: any = {
        tipo: TipoSubServicio.PRODUCTO,
        isActive: true,
      };

      let relations = ['servicio', 'preciosPorPais', 'preciosPorPais.pais'];

      if (pais && pais.trim() !== '') {
        relations = [
          'servicio',
          'preciosPorPais',
          'preciosPorPais.pais',
          'marca',
          'proveedor',
          'categoria',
        ];
      }

      const [servicios, total] = await this.sub_servicio_repo.findAndCount({
        where: whereConditions,
        relations: relations,
        order: {
          createdAt: 'DESC',
        },
        take: limit,
        skip: offset,
      });

      if (!servicios || servicios.length === 0) {
        throw new BadRequestException(
          'No se encontraron productos disponibles' +
            (pais ? ` para el país ${pais}` : ''),
        );
      }

      let productosFiltrados = servicios;
      if (pais && pais.trim() !== '') {
        productosFiltrados = servicios.filter((servicio) =>
          servicio.preciosPorPais.some(
            (precio) => precio.pais.id === pais || precio.pais.nombre === pais,
          ),
        );

        productosFiltrados.forEach((producto) => {
          producto.preciosPorPais = producto.preciosPorPais.filter(
            (precio) => precio.pais.id === pais || precio.pais.nombre === pais,
          );
        });
      }

      return {
        servicios: instanceToPlain(productosFiltrados),
        total: productosFiltrados.length,
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
      atributos,
      categoriaId,
      codigo_barra,
      costo,
      marcaId,
      paisId,
      precio,
      proveedorId,
      tax_rate,
    } = updateSubServicioDto;

    try {
      const sub_servicio = await this.sub_servicio_repo.findOne({
        where: { id },
        relations: ['servicio', 'marca', 'proveedor', 'categoria'],
      });

      if (!sub_servicio) {
        throw new NotFoundException(
          'No se encontró el subservicio que desea actualizar',
        );
      }

      if (tipo && tipo !== sub_servicio.tipo) {
        if (tipo === TipoSubServicio.SERVICIO) {
          if (!servicioId) {
            throw new BadRequestException(
              'El ID del servicio es requerido al cambiar a tipo SERVICIO',
            );
          }
          const servicio = await this.servicioRepo.findOne({
            where: { id: servicioId, isActive: true },
          });
          if (!servicio) {
            throw new NotFoundException('Servicio no encontrado o inactivo');
          }
          sub_servicio.servicio = servicio;
          sub_servicio.marca = null;
          sub_servicio.proveedor = null;
          sub_servicio.categoria = null;
        } else {
          sub_servicio.servicio = null;
        }
        sub_servicio.tipo = tipo;
      }

      if (servicioId && sub_servicio.tipo === TipoSubServicio.SERVICIO) {
        const servicio = await this.servicioRepo.findOne({
          where: { id: servicioId, isActive: true },
        });
        if (!servicio) {
          throw new NotFoundException(
            'No se encontró el servicio relacionado o está inactivo',
          );
        }
        sub_servicio.servicio = servicio;
      }

      if (unidad_venta !== undefined) sub_servicio.unidad_venta = unidad_venta;
      if (nombre !== undefined) sub_servicio.nombre = nombre;
      if (descripcion !== undefined) sub_servicio.descripcion = descripcion;
      if (isActive !== undefined) sub_servicio.isActive = isActive;
      if (disponible !== undefined) sub_servicio.disponible = disponible;

      if (isActive === false && disponible === true) {
        throw new BadRequestException(
          'No se puede tener un sub-servicio inactivo pero disponible',
        );
      }

      if (sub_servicio.tipo === TipoSubServicio.PRODUCTO) {
        if (marcaId) {
          const marca = await this.marcaRepo.findOne({
            where: { id: marcaId, is_active: true },
          });
          if (!marca)
            throw new NotFoundException('Marca no encontrada o inactiva');
          sub_servicio.marca = marca;
        }

        if (proveedorId) {
          const proveedor = await this.proveedorRepo.findOne({
            where: { id: proveedorId, is_active: true },
          });
          if (!proveedor)
            throw new NotFoundException('Proveedor no encontrado o inactivo');
          sub_servicio.proveedor = proveedor;
        }

        if (categoriaId) {
          const categoria = await this.categoriaRepo.findOne({
            where: { id: categoriaId, is_active: true },
          });
          if (!categoria)
            throw new NotFoundException('Categoría no encontrada o inactiva');
          sub_servicio.categoria = categoria;
        }

        if (codigo_barra !== undefined)
          sub_servicio.codigo_barra = codigo_barra;
        if (atributos !== undefined) sub_servicio.atributos = atributos;
        if (tax_rate !== undefined) sub_servicio.tax_rate = tax_rate;

        if (paisId) {
          const pais = await this.paisRepo.findOne({ where: { id: paisId } });
          if (!pais) throw new NotFoundException('País no encontrado');

          let servicioPai = await this.serviciosPaiRepo.findOne({
            where: {
              subServicio: { id: sub_servicio.id },
              pais: { id: paisId },
            },
            relations: ['subServicio', 'pais'],
          });

          if (!servicioPai) {
            servicioPai = this.serviciosPaiRepo.create({
              subServicio: sub_servicio,
              pais,
              precio,
              costo,
            });
          } else {
            if (precio !== undefined) servicioPai.precio = precio;
            if (costo !== undefined) servicioPai.costo = costo;
          }

          await this.serviciosPaiRepo.save(servicioPai);
        }
      }

      const subServicioActualizado = await this.sub_servicio_repo.save(
        sub_servicio,
      );

      return {
        message: 'Subservicio actualizado correctamente',
        data: instanceToPlain(subServicioActualizado),
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} subServicio`;
  }
}
