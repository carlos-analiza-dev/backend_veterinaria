import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { FilterSucursalDto } from './dto/filter-sucursal.dto';
import { Sucursal } from './entities/sucursal.entity';
import { PaginationDto } from '../common/dto/pagination-common.dto';
import { User } from '../auth/entities/auth.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { instanceToPlain } from 'class-transformer';
import { DistanceSucursalesService } from 'src/distance_sucursales/distance_sucursales.service';
import { NearbySucursalesDto } from 'src/common/dto/nearby-sucursales.dto';
import { SucursalCercanaDto } from 'src/distance_sucursales/dto/sucursal-cercana.dto';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pai)
    private readonly paisRepository: Repository<Pai>,
    @InjectRepository(DepartamentosPai)
    private readonly deptoRepository: Repository<DepartamentosPai>,
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepository: Repository<MunicipiosDepartamentosPai>,
    private distanceService: DistanceSucursalesService,
  ) {}

  async create(createSucursalDto: CreateSucursalDto): Promise<Sucursal> {
    const { departamentoId, paisId, municipioId } = createSucursalDto;
    try {
      const pais_exist = await this.paisRepository.findOne({
        where: { id: paisId },
      });
      if (!pais_exist) {
        throw new NotFoundException('Pais seleccionado no encontrado');
      }

      const departamento = await this.deptoRepository.findOne({
        where: { id: departamentoId },
      });
      if (!departamento) {
        throw new NotFoundException('Departamento seleccionado no encontrado');
      }

      const municipio = await this.municipioRepository.findOne({
        where: { id: municipioId },
      });
      if (!municipio) {
        throw new NotFoundException('Municipio seleccionado no encontrado');
      }

      const existingSucursal = await this.sucursalRepository.findOne({
        where: { nombre: createSucursalDto.nombre },
      });

      if (existingSucursal) {
        throw new BadRequestException(
          `Ya existe una sucursal con el nombre: ${createSucursalDto.nombre}`,
        );
      }

      const gerente = await this.userRepository.findOne({
        where: { id: createSucursalDto.gerenteId },
      });

      if (!gerente) {
        throw new NotFoundException(
          `Gerente con ID ${createSucursalDto.gerenteId} no encontrado`,
        );
      }

      const es_Gerente = await this.sucursalRepository.findOne({
        where: {
          gerente: { id: gerente.id },
        },
      });

      if (es_Gerente)
        throw new BadRequestException(
          'Este gerente ya esta asociado a una sucursal',
        );

      const sucursal = this.sucursalRepository.create({
        departamentoId,
        municipioId,
        paisId,
        ...createSucursalDto,
      });
      return await this.sucursalRepository.save(sucursal);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(filterDto: FilterSucursalDto) {
    const {
      limit = 10,
      offset = 0,
      tipo,
      paisId,
      departamentoId,
      municipioId,
      isActive,
      search,
    } = filterDto;

    try {
      const queryBuilder = this.sucursalRepository
        .createQueryBuilder('sucursal')
        .leftJoinAndSelect('sucursal.pais', 'pais')
        .leftJoinAndSelect('sucursal.departamento', 'departamento')
        .leftJoinAndSelect('sucursal.municipio', 'municipio')
        .leftJoinAndSelect('sucursal.gerente', 'gerente');

      if (tipo) {
        queryBuilder.andWhere('sucursal.tipo = :tipo', { tipo });
      }

      if (paisId) {
        queryBuilder.andWhere('sucursal.paisId = :paisId', { paisId });
      }

      if (departamentoId) {
        queryBuilder.andWhere('sucursal.departamentoId = :departamentoId', {
          departamentoId,
        });
      }

      if (municipioId) {
        queryBuilder.andWhere('sucursal.municipioId = :municipioId', {
          municipioId,
        });
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere('sucursal.isActive = :isActive', { isActive });
      }

      if (search) {
        queryBuilder.andWhere('sucursal.nombre ILIKE :search', {
          search: `%${search}%`,
        });
      }

      queryBuilder
        .take(limit)
        .skip(offset)
        .orderBy('sucursal.createdAt', 'DESC');

      const [sucursales, total] = await queryBuilder.getManyAndCount();

      return {
        data: instanceToPlain(sucursales),
        total,
        limit,
        offset,
        filters: {
          tipo,
          paisId,
          departamentoId,
          municipioId,
          isActive,
          search,
        },
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllActive(paginationDto: PaginationDto) {
    return this.findAll({ ...paginationDto, isActive: true });
  }

  async findByPaisFree(paisId: string) {
    return this.sucursalRepository.find({
      where: {
        isActive: true,
        pais: { id: paisId },
      },
    });
  }

  async findByPais(paisId: string, filterDto?: FilterSucursalDto) {
    return this.findAll({ ...filterDto, paisId });
  }

  async findOne(id: string): Promise<Sucursal> {
    try {
      const sucursal = await this.sucursalRepository.findOne({
        where: { id },
        relations: ['pais', 'municipio', 'departamento', 'gerente'],
      });

      if (!sucursal) {
        throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
      }

      return sucursal;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //SUCURSALES CERCANAS
  async findNearbySucursales(
    nearbyDto: NearbySucursalesDto,
  ): Promise<SucursalCercanaDto[]> {
    const { latitud, longitud, limite, radio, usarGoogleMaps } = nearbyDto;

    const sucursales = await this.sucursalRepository.find({
      where: { isActive: true },
      relations: ['pais'],
    });

    const sucursalesConCoordenadas = sucursales.filter(
      (suc) => suc.latitud !== null && suc.longitud !== null,
    );

    const sucursalesConDistancia: SucursalCercanaDto[] = [];

    for (const sucursal of sucursalesConCoordenadas) {
      let distancia = 0;
      let tiempoEstimado = null;

      if (usarGoogleMaps) {
        try {
          const result = await this.distanceService.calculateDistance(
            latitud,
            longitud,
            sucursal.latitud,
            sucursal.longitud,
          );
          distancia = result.distance;
          tiempoEstimado = result.duration;
        } catch (error) {
          distancia = this.distanceService.calculateHaversineDistance(
            latitud,
            longitud,
            sucursal.latitud,
            sucursal.longitud,
          );
        }
      } else {
        distancia = this.distanceService.calculateHaversineDistance(
          latitud,
          longitud,
          sucursal.latitud,
          sucursal.longitud,
        );
      }

      const distanciaLineaRecta =
        this.distanceService.calculateHaversineDistance(
          latitud,
          longitud,
          sucursal.latitud,
          sucursal.longitud,
        );

      if (distancia <= radio) {
        sucursalesConDistancia.push({
          sucursal,
          distancia_km: Number(distancia.toFixed(2)),
          tiempo_estimado_minutos: tiempoEstimado
            ? Math.round(tiempoEstimado)
            : undefined,
          distancia_linea_recta_km: Number(distanciaLineaRecta.toFixed(2)),
        });
      }
    }

    sucursalesConDistancia.sort((a, b) => a.distancia_km - b.distancia_km);

    return sucursalesConDistancia.slice(0, limite);
  }

  async update(
    id: string,
    updateSucursalDto: UpdateSucursalDto,
  ): Promise<Sucursal> {
    try {
      const sucursal = await this.findOne(id);

      if (
        updateSucursalDto.nombre &&
        updateSucursalDto.nombre !== sucursal.nombre
      ) {
        const existingSucursal = await this.sucursalRepository.findOne({
          where: { nombre: updateSucursalDto.nombre },
        });

        if (existingSucursal) {
          throw new BadRequestException(
            `Ya existe una sucursal con el nombre: ${updateSucursalDto.nombre}`,
          );
        }
      }

      if (updateSucursalDto.gerenteId !== undefined) {
        if (
          updateSucursalDto.gerenteId === null ||
          updateSucursalDto.gerenteId === ''
        ) {
          sucursal.gerente = null;
        } else {
          const gerente = await this.userRepository.findOne({
            where: { id: updateSucursalDto.gerenteId },
          });

          if (!gerente) {
            throw new NotFoundException(
              `Gerente con ID ${updateSucursalDto.gerenteId} no encontrado`,
            );
          }

          const esGerenteAsignado = await this.sucursalRepository.findOne({
            where: {
              gerente: { id: gerente.id },
            },
            relations: ['gerente'],
          });

          if (esGerenteAsignado && esGerenteAsignado.id !== sucursal.id) {
            throw new BadRequestException(
              'Este gerente ya está asociado a otra sucursal',
            );
          }

          sucursal.gerente = gerente;
        }

        delete updateSucursalDto.gerenteId;
      }

      Object.assign(sucursal, updateSucursalDto);

      return await this.sucursalRepository.save(sucursal);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const sucursal = await this.findOne(id);

      sucursal.isActive = false;
      await this.sucursalRepository.save(sucursal);

      return { message: `Sucursal ${sucursal.nombre} ha sido desactivada` };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async getStats(paisId?: string) {
    try {
      const queryBase = { isActive: true };

      if (paisId) {
        Object.assign(queryBase, { paisId });
      }

      const [
        totalActivas,
        totalInactivas,
        totalBodegas,
        totalCasasMatriz,
        totalSucursalesNormales,
      ] = await Promise.all([
        this.sucursalRepository.count({ where: queryBase }),
        this.sucursalRepository.count({
          where: { ...queryBase, isActive: false },
        }),
        this.sucursalRepository.count({
          where: { ...queryBase, tipo: 'bodega' as any },
        }),
        this.sucursalRepository.count({
          where: { ...queryBase, tipo: 'casa_matriz' as any },
        }),
        this.sucursalRepository.count({
          where: { ...queryBase, tipo: 'sucursal' as any },
        }),
      ]);

      const totalGeneral = await this.sucursalRepository.count(
        paisId ? { where: { paisId } } : {},
      );

      return {
        total: totalGeneral,
        activas: totalActivas,
        inactivas: totalInactivas,
        porTipo: {
          bodegas: totalBodegas,
          casasMatriz: totalCasasMatriz,
          sucursales: totalSucursalesNormales,
        },
        filtradoPor: paisId ? { paisId } : null,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findByGerente(gerenteId: string, paginationDto?: PaginationDto) {
    return this.findAll({ ...paginationDto, search: undefined });
  }

  private handleDBExceptions(error: any): never {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException(
      'Error inesperado, revise los logs del servidor',
    );
  }
}
