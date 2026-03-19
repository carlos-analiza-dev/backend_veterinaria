import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { ServicioReproductivo } from './entities/servicios_reproductivo.entity';
import { DetalleServicio } from 'src/detalles_servicio_reproductivo/entities/detalles_servicio_reproductivo.entity';
import { CreateServiciosReproductivoDto } from './dto/create-servicios_reproductivo.dto';
import { UpdateServiciosReproductivoDto } from './dto/update-servicios_reproductivo.dto';
import { FilterServiciosDto } from './dto/filter-servicios.dto';
import { AnimalFinca } from 'src/animal_finca/entities/animal_finca.entity';
import { CelosAnimal } from 'src/celos_animal/entities/celos_animal.entity';
import { EstadoServicio } from 'src/interfaces/servicios-reproductivos.enum';

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
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateServiciosReproductivoDto) {
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

      if (createDto.celo_id) {
        const celo = await this.celoRepo.findOne({
          where: { id: createDto.celo_id },
          relations: ['animal'],
        });

        const servicio_celo_existe = await this.servicioRepo.findOne({
          where: { celo_asociado: { id: celo.id } },
        });
        if (servicio_celo_existe)
          throw new BadRequestException(
            'Este celo ya esta asociado a un servicio',
          );

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

      return 'Servicio Guardado con Exito';
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
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

  async update(
    id: string,
    updateDto: UpdateServiciosReproductivoDto,
  ): Promise<ServicioReproductivo> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const servicio = await this.findOne(id);

      if (
        updateDto.estado === EstadoServicio.REALIZADO &&
        servicio.estado !== EstadoServicio.REALIZADO
      ) {
        await this.validarServicioRealizado(servicio);
      }

      Object.assign(servicio, updateDto);

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
