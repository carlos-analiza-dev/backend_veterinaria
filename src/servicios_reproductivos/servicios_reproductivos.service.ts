import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource, Not } from 'typeorm';
import { ServicioReproductivo } from './entities/servicios_reproductivo.entity';
import { DetalleServicio } from 'src/detalles_servicio_reproductivo/entities/detalles_servicio_reproductivo.entity';
import { CreateServiciosReproductivoDto } from './dto/create-servicios_reproductivo.dto';
import { UpdateServiciosReproductivoDto } from './dto/update-servicios_reproductivo.dto';
import { FilterServiciosDto } from './dto/filter-servicios.dto';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import {
  EstadoServicio,
  TipoServicio,
} from 'src/interfaces/servicios-reproductivos.enum';
import { EstadoCeloAnimal } from 'src/interfaces/celos.animal.enum';
import { UpdateEstadoServicioDto } from './dto/update-estado-servicio.dto';
import { PartoAnimal } from 'src/parto_animal/entities/parto_animal.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';

@Injectable()
export class ServiciosReproductivosService {
  constructor(
    @InjectRepository(ServicioReproductivo)
    private servicioRepo: Repository<ServicioReproductivo>,
    @InjectRepository(DetalleServicio)
    private detalleRepo: Repository<DetalleServicio>,
    @InjectRepository(AnimalFinca)
    private animalRepo: Repository<AnimalFinca>,
    @InjectRepository(CelosAnimal)
    private celoRepo: Repository<CelosAnimal>,
    @InjectRepository(PartoAnimal)
    private partoRepo: Repository<PartoAnimal>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateServiciosReproductivoDto, cliente: Cliente) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hembra = await this.animalRepo.findOne({
        where: { id: createDto.hembra_id },
        relations: ['especie', 'finca'],
      });

      if (!hembra) {
        throw new NotFoundException(
          `Hembra con ID ${createDto.hembra_id} no encontrada`,
        );
      }

      if (hembra.sexo !== 'Hembra') {
        throw new BadRequestException(
          'El animal seleccionado no es una hembra',
        );
      }

      if (createDto.macho_id) {
        const macho = await this.animalRepo.findOne({
          where: { id: createDto.macho_id },
        });

        if (!macho) {
          throw new NotFoundException(
            `Macho con ID ${createDto.macho_id} no encontrado`,
          );
        }

        if (macho.sexo !== 'Macho') {
          throw new BadRequestException(
            'El animal seleccionado no es un macho',
          );
        }
      }

      if (
        createDto.tipo_servicio === TipoServicio.MONTA_NATURAL &&
        !createDto.macho_id
      ) {
        throw new BadRequestException(
          'Debe seleccionar un macho para un servicio de monta natural',
        );
      }

      let celo = null;
      if (createDto.celo_id) {
        celo = await this.celoRepo.findOne({
          where: { id: createDto.celo_id },
          relations: ['animal'],
        });

        if (!celo) {
          throw new NotFoundException(
            `Celo con ID ${createDto.celo_id} no encontrado`,
          );
        }

        if (celo.animal.id !== hembra.id) {
          throw new BadRequestException(
            'El celo no pertenece a la hembra seleccionada',
          );
        }

        const servicioCeloExiste = await this.servicioRepo.findOne({
          where: { celo_asociado: { id: celo.id } },
        });

        if (servicioCeloExiste) {
          throw new BadRequestException(
            'Este celo ya está asociado a un servicio',
          );
        }

        await this.validarFechaServicioEnCelo(
          celo,
          new Date(createDto.fecha_servicio),
        );

        if (celo.estado === EstadoCeloAnimal.PREÑADO) {
          throw new BadRequestException(
            'No se puede registrar un servicio porque este celo ya resultó en preñez',
          );
        }

        if (celo.estado === EstadoCeloAnimal.FINALIZADO) {
          throw new BadRequestException(
            'No se puede registrar un servicio porque este celo ya finalizó',
          );
        }
      }

      if (!createDto.numero_servicio) {
        createDto.numero_servicio = await this.calcularNumeroServicio(
          hembra.id,
        );
      }

      await this.validarSinServicioActivo(
        hembra.id,
        new Date(createDto.fecha_servicio),
      );

      const servicio = this.servicioRepo.create({
        hembra,
        macho: createDto.macho_id ? ({ id: createDto.macho_id } as any) : null,
        tipo_servicio: createDto.tipo_servicio,
        estado: createDto.estado || EstadoServicio.PROGRAMADO,
        fecha_servicio: new Date(createDto.fecha_servicio),
        numero_servicio: createDto.numero_servicio,
        celo_asociado: createDto.celo_id
          ? ({ id: createDto.celo_id } as any)
          : null,
        dosis_semen: createDto.dosis_semen,
        proveedor_semen: createDto.proveedor_semen,
        tecnico_responsable: createDto.tecnico_responsable,
        exitoso: createDto.exitoso || false,
        observaciones: createDto.observaciones,
        metadata: createDto.metadata,
        creadoPorId: cliente.id,
      });

      const servicioGuardado = await queryRunner.manager.save(servicio);

      if (createDto.detalles && createDto.detalles.length > 0) {
        const detalles = createDto.detalles.map((detalle) =>
          this.detalleRepo.create({
            ...detalle,
            servicio: servicioGuardado,
          }),
        );
        await queryRunner.manager.save(detalles);
      }

      await queryRunner.commitTransaction();

      return 'Servicio Guardado con Éxito';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //SERVICIOS PARA CREAR
  private async validarFechaServicioEnCelo(
    celo: CelosAnimal,
    fechaServicio: Date,
  ): Promise<void> {
    const fechaInicioCelo = new Date(celo.fechaInicio);
    const fechaServicioDate = new Date(fechaServicio);

    if (fechaServicioDate < fechaInicioCelo) {
      throw new BadRequestException(
        `La fecha y hora del servicio (${this.formatearFechaHora(fechaServicioDate)}) ` +
          `no puede ser anterior al inicio del celo (${this.formatearFechaHora(fechaInicioCelo)})`,
      );
    }

    if (celo.fechaFin) {
      const fechaFinCelo = new Date(celo.fechaFin);
      if (fechaServicioDate > fechaFinCelo) {
        throw new BadRequestException(
          `La fecha y hora del servicio (${this.formatearFechaHora(fechaServicioDate)}) ` +
            `no puede ser posterior al fin del celo (${this.formatearFechaHora(fechaFinCelo)})`,
        );
      }
    } else {
      const horasDesdeInicio =
        (fechaServicioDate.getTime() - fechaInicioCelo.getTime()) /
        (1000 * 60 * 60);
      const horasMinimas = 0;
      const horasMaximas = 48;

      if (horasDesdeInicio < horasMinimas) {
        throw new BadRequestException(
          `La fecha y hora del servicio (${this.formatearFechaHora(fechaServicioDate)}) ` +
            `no puede ser anterior al inicio del celo (${this.formatearFechaHora(fechaInicioCelo)})`,
        );
      }

      if (horasDesdeInicio > horasMaximas) {
        throw new BadRequestException(
          `El servicio debe realizarse dentro de las ${horasMaximas} horas posteriores al inicio del celo.\n` +
            `📅 Inicio del celo: ${this.formatearFechaHora(fechaInicioCelo)}\n` +
            `⏰ Hora del servicio: ${this.formatearFechaHora(fechaServicioDate)}\n` +
            `⏱️ Horas transcurridas: ${horasDesdeInicio.toFixed(1)} horas\n` +
            `⚠️ Ha excedido el límite de ${horasMaximas} horas.`,
        );
      }
    }
  }

  private formatearFechaHora(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  async findAll(filters: FilterServiciosDto) {
    const {
      hembra_id,
      finca_id,
      tipo_servicio,
      estado,
      fecha_desde,
      fecha_hasta,
      exitoso,
      page = 1,
      limit = 10,
    } = filters;

    const query = this.servicioRepo
      .createQueryBuilder('servicio')
      .leftJoin('servicio.hembra', 'hembra')
      .leftJoin('servicio.macho', 'macho')
      .leftJoin('servicio.celo_asociado', 'celo')
      .leftJoin('servicio.detalles', 'detalles')

      .select([
        'servicio.id',
        'servicio.tipo_servicio',
        'servicio.fecha_servicio',
        'servicio.numero_servicio',
        'servicio.exitoso',
        'servicio.estado',
        'servicio.dosis_semen',
        'servicio.proveedor_semen',
        'servicio.tecnico_responsable',
        'servicio.proveedor_semen',
        'servicio.macho_externo_nombre',
        'servicio.macho_pertenece_finca',
        'servicio.observaciones',
        'servicio.metadata',
        'servicio.macho_pertenece_finca',

        'hembra.id',
        'hembra.identificador',

        'macho.id',
        'macho.identificador',

        'celo.id',
        'celo.fechaInicio',

        'detalles.id',
        'detalles.hora_servicio',
        'detalles.numero_monta',
      ]);

    if (hembra_id) {
      query.andWhere('hembra.id = :hembra_id', { hembra_id });
    }

    if (finca_id) {
      query.andWhere('hembra.fincaId = :finca_id', { finca_id });
    }

    if (tipo_servicio) {
      query.andWhere('servicio.tipo_servicio = :tipo_servicio', {
        tipo_servicio,
      });
    }

    if (estado) {
      query.andWhere('servicio.estado = :estado', { estado });
    }

    if (fecha_desde && fecha_hasta) {
      query.andWhere(
        'servicio.fecha_servicio BETWEEN :fecha_desde AND :fecha_hasta',
        {
          fecha_desde: new Date(fecha_desde),
          fecha_hasta: new Date(fecha_hasta),
        },
      );
    }

    if (exitoso !== undefined) {
      query.andWhere('servicio.exitoso = :exitoso', { exitoso });
    }

    const total = await query.getCount();

    const data = await query
      .orderBy('servicio.fecha_servicio', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ServicioReproductivo> {
    const servicio = await this.servicioRepo.findOne({
      where: { id },
      relations: [
        'hembra',
        'hembra.finca',
        'hembra.especie',
        'macho',
        'celo_asociado',
        'detalles',
      ],
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }

    return servicio;
  }

  async findAllHembraId(id: string) {
    try {
      const hembra = await this.animalRepo.findOne({
        where: { id: id },
        select: ['id', 'sexo'],
      });

      if (!hembra) {
        throw new NotFoundException('No se encontró la hembra seleccionada');
      }

      if (hembra.sexo !== 'Hembra') {
        throw new NotFoundException('El animal seleccionado no es una hembra');
      }

      const servicios = await this.servicioRepo
        .createQueryBuilder('servicio')
        .leftJoinAndSelect('servicio.hembra', 'hembra')
        .leftJoinAndSelect('servicio.macho', 'macho')
        .leftJoinAndSelect('servicio.celo_asociado', 'celo')
        .leftJoinAndSelect('servicio.detalles', 'detalles')
        .leftJoin('partos_animales', 'parto', 'parto.servicio_id = servicio.id')
        .where('servicio.hembra_id = :hembraId', { hembraId: id })
        .andWhere('servicio.estado = :estado', {
          estado: EstadoServicio.REALIZADO,
        })
        .andWhere('servicio.exitoso = :exitoso', { exitoso: true })
        .andWhere('parto.id IS NULL')
        .orderBy('servicio.fecha_servicio', 'DESC')
        .getMany();

      return servicios;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al obtener servicios de la hembra`);
    }
  }

  async update(
    id: string,
    updateDto: UpdateServiciosReproductivoDto,
    cliente: Cliente,
  ): Promise<ServicioReproductivo> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const servicio = await this.findOne(id);

      if (updateDto.macho_pertenece_finca !== undefined) {
        servicio.macho_pertenece_finca = updateDto.macho_pertenece_finca;

        if (updateDto.macho_pertenece_finca === false) {
          servicio.macho = null;
        }
      }

      if (updateDto.macho_id !== undefined) {
        if (servicio.macho_pertenece_finca === false) {
          throw new BadRequestException(
            'No se puede asignar un macho de la finca cuando el servicio usa un macho externo',
          );
        }

        if (updateDto.macho_id) {
          const macho = await this.animalRepo.findOne({
            where: { id: updateDto.macho_id },
          });

          if (!macho) {
            throw new NotFoundException(
              `Macho con ID ${updateDto.macho_id} no encontrado`,
            );
          }

          if (macho.sexo !== 'Macho') {
            throw new BadRequestException(
              'El animal seleccionado no es un macho',
            );
          }

          servicio.macho = macho;
        } else {
          servicio.macho = null;
        }
      }

      if (updateDto.celo_id !== undefined) {
        if (updateDto.celo_id) {
          const nuevoCelo = await this.celoRepo.findOne({
            where: { id: updateDto.celo_id },
            relations: ['animal'],
          });

          if (!nuevoCelo) {
            throw new NotFoundException(
              `Celo con ID ${updateDto.celo_id} no encontrado`,
            );
          }

          if (nuevoCelo.animal.id !== servicio.hembra.id) {
            throw new BadRequestException(
              'El celo no pertenece a la hembra del servicio',
            );
          }

          const servicioCeloExiste = await this.servicioRepo.findOne({
            where: {
              celo_asociado: { id: nuevoCelo.id },
              id: Not(id),
            },
          });

          if (servicioCeloExiste) {
            throw new BadRequestException(
              'Este celo ya está asociado a otro servicio',
            );
          }

          const fechaServicio = updateDto.fecha_servicio
            ? new Date(updateDto.fecha_servicio)
            : servicio.fecha_servicio;

          await this.validarFechaServicioEnCelo(nuevoCelo, fechaServicio);

          servicio.celo_asociado = nuevoCelo;
        } else {
          servicio.celo_asociado = null;
        }
      }

      if (updateDto.fecha_servicio) {
        const nuevaFechaServicio = new Date(updateDto.fecha_servicio);

        const celoAsociado =
          updateDto.celo_id !== undefined
            ? updateDto.celo_id
              ? await this.celoRepo.findOne({
                  where: { id: updateDto.celo_id },
                  relations: ['animal'],
                })
              : null
            : servicio.celo_asociado;

        if (celoAsociado) {
          await this.validarFechaServicioEnCelo(
            celoAsociado,
            nuevaFechaServicio,
          );
        }

        servicio.fecha_servicio = nuevaFechaServicio;
      }

      if (updateDto.estado !== undefined) {
        if (
          updateDto.estado === EstadoServicio.REALIZADO &&
          servicio.estado !== EstadoServicio.REALIZADO
        ) {
          await this.validarServicioRealizado(servicio);
        }
        servicio.estado = updateDto.estado;
      }

      if (updateDto.tipo_servicio !== undefined) {
        servicio.tipo_servicio = updateDto.tipo_servicio;

        if (
          updateDto.tipo_servicio === TipoServicio.MONTA_NATURAL &&
          !servicio.macho
        ) {
          throw new BadRequestException(
            'Para un servicio de monta natural debe seleccionar un macho',
          );
        }
      }

      if (updateDto.numero_servicio !== undefined) {
        servicio.numero_servicio = updateDto.numero_servicio;
      }

      if (updateDto.dosis_semen !== undefined) {
        servicio.dosis_semen = updateDto.dosis_semen;
      }

      if (updateDto.proveedor_semen !== undefined) {
        servicio.proveedor_semen = updateDto.proveedor_semen;
      }

      if (updateDto.tecnico_responsable !== undefined) {
        servicio.tecnico_responsable = updateDto.tecnico_responsable;
      }

      if (updateDto.observaciones !== undefined) {
        servicio.observaciones = updateDto.observaciones;
      }

      if (updateDto.macho_externo_nombre !== undefined) {
        servicio.macho_externo_nombre = updateDto.macho_externo_nombre;
      }

      if (updateDto.macho_pertenece_finca !== undefined) {
        servicio.macho_pertenece_finca = updateDto.macho_pertenece_finca;
      }

      if (updateDto.metadata !== undefined) {
        servicio.metadata = updateDto.metadata;
      }

      if (updateDto.exitoso !== undefined) {
        const celoAsociado = servicio.celo_asociado;

        if (updateDto.exitoso === true && servicio.exitoso !== true) {
          if (celoAsociado) {
            if (celoAsociado.estado === EstadoCeloAnimal.PREÑADO) {
              throw new BadRequestException(
                'Este celo ya está marcado como preñado',
              );
            }

            celoAsociado.estado = EstadoCeloAnimal.PREÑADO;
            await queryRunner.manager.save(celoAsociado);
          }
          servicio.exitoso = true;
        } else if (updateDto.exitoso === false && servicio.exitoso !== false) {
          if (
            celoAsociado &&
            celoAsociado.estado !== EstadoCeloAnimal.PREÑADO
          ) {
            const otrosServicios = await this.servicioRepo.find({
              where: {
                celo_asociado: { id: celoAsociado.id },
                id: Not(id),
              },
            });

            if (
              otrosServicios.length === 0 &&
              servicio.estado === EstadoServicio.FALLIDO
            ) {
              celoAsociado.estado = EstadoCeloAnimal.NO_FECUNDADO;
              await queryRunner.manager.save(celoAsociado);
            }
          }
          servicio.exitoso = false;
        }
      }
      servicio.actualizadoPorId = cliente.id;
      const servicioActualizado = await queryRunner.manager.save(servicio);

      if (updateDto.detalles && updateDto.detalles.length > 0) {
        await queryRunner.manager.delete(DetalleServicio, { servicio: { id } });

        const nuevosDetalles = updateDto.detalles.map((detalle) =>
          this.detalleRepo.create({
            ...detalle,
            servicio: servicioActualizado,
          }),
        );
        await queryRunner.manager.save(nuevosDetalles);
      } else if (
        updateDto.detalles !== undefined &&
        updateDto.detalles.length === 0
      ) {
        await queryRunner.manager.delete(DetalleServicio, { servicio: { id } });
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async actualizarEstadoServicio(id: string, dto: UpdateEstadoServicioDto) {
    const servicio = await this.servicioRepo.findOne({
      where: { id },
    });

    if (!servicio) {
      throw new NotFoundException('Servicio reproductivo no encontrado');
    }

    if (dto.estado !== undefined) {
      servicio.estado = dto.estado;
    }

    if (dto.exitoso !== undefined) {
      servicio.exitoso = dto.exitoso;
    }

    return await this.servicioRepo.save(servicio);
  }

  async remove(id: string): Promise<{ message: string }> {
    const servicio = await this.findOne(id);

    if (servicio.estado === EstadoServicio.REALIZADO) {
      throw new BadRequestException(
        'No se puede eliminar un servicio ya realizado',
      );
    }

    await this.servicioRepo.remove(servicio);
    return { message: 'Servicio eliminado correctamente' };
  }

  async getServiciosPorHembra(
    hembraId: string,
  ): Promise<ServicioReproductivo[]> {
    return this.servicioRepo.find({
      where: { hembra: { id: hembraId } },
      relations: ['detalles', 'macho'],
      order: { fecha_servicio: 'DESC' },
    });
  }

  async getServiciosPendientes(
    fincaId?: string,
  ): Promise<ServicioReproductivo[]> {
    const query = this.servicioRepo
      .createQueryBuilder('servicio')
      .leftJoinAndSelect('servicio.hembra', 'hembra')
      .leftJoinAndSelect('hembra.finca', 'finca')
      .where('servicio.estado = :estado', { estado: EstadoServicio.PROGRAMADO })
      .andWhere('servicio.fecha_servicio >= :hoy', { hoy: new Date() });

    if (fincaId) {
      query.andWhere('finca.id = :fincaId', { fincaId });
    }

    return query.orderBy('servicio.fecha_servicio', 'ASC').getMany();
  }

  async getEstadisticasPorFinca(
    fincaId: string,
    periodo: 'semana' | 'mes' | 'año' = 'mes',
  ): Promise<any> {
    const fechaInicio = new Date();
    switch (periodo) {
      case 'semana':
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        break;
      case 'mes':
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
      case 'año':
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
    }

    const servicios = await this.servicioRepo
      .createQueryBuilder('servicio')
      .leftJoin('servicio.hembra', 'hembra')
      .leftJoin('hembra.finca', 'finca')
      .where('finca.id = :fincaId', { fincaId })
      .andWhere('servicio.fecha_servicio >= :fechaInicio', { fechaInicio })
      .getMany();

    const total = servicios.length;
    const exitosos = servicios.filter((s) => s.exitoso).length;
    const porTipo = servicios.reduce((acc, s) => {
      acc[s.tipo_servicio] = (acc[s.tipo_servicio] || 0) + 1;
      return acc;
    }, {});

    return {
      periodo,
      total,
      exitosos,
      tasa_exito: total > 0 ? (exitosos / total) * 100 : 0,
      por_tipo: porTipo,
      pendientes: servicios.filter(
        (s) => s.estado === EstadoServicio.PROGRAMADO,
      ).length,
    };
  }

  private async calcularNumeroServicio(hembraId: string): Promise<number> {
    const count = await this.servicioRepo.count({
      where: { hembra: { id: hembraId } },
    });
    return count + 1;
  }

  private async validarSinServicioActivo(
    hembraId: string,
    fechaServicio: Date,
  ): Promise<void> {
    const servicioActivo = await this.servicioRepo.findOne({
      where: {
        hembra: { id: hembraId },
        estado: EstadoServicio.PROGRAMADO,
        fecha_servicio: Between(
          new Date(fechaServicio.setHours(0, 0, 0, 0)),
          new Date(fechaServicio.setHours(23, 59, 59, 999)),
        ),
      },
    });

    if (servicioActivo) {
      throw new BadRequestException(
        'La hembra ya tiene un servicio programado para esta fecha',
      );
    }
  }

  private async validarServicioRealizado(
    servicio: ServicioReproductivo,
  ): Promise<void> {
    if (!servicio.detalles || servicio.detalles.length === 0) {
      throw new BadRequestException(
        'Debe registrar al menos un detalle del servicio',
      );
    }

    const totalMontas = servicio.detalles.reduce(
      (sum, d) => sum + d.numero_monta,
      0,
    );
    if (totalMontas === 0) {
      throw new BadRequestException('Debe registrar al menos una monta');
    }
  }
}
