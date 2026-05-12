import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cultivo } from './entities/cultivo.entity';
import { Repository } from 'typeorm';
import { FincasGanadero } from 'src/fincas_ganadero/entities/fincas_ganadero.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { getPropietarioId } from 'src/utils/get-propietario-id';

@Injectable()
export class CultivosService {
  constructor(
    @InjectRepository(Cultivo)
    private readonly cultivoRepository: Repository<Cultivo>,
    @InjectRepository(FincasGanadero)
    private readonly fincaRepository: Repository<FincasGanadero>,
  ) {}
  async create(createCultivoDto: CreateCultivoDto, cliente: Cliente) {
    const { fecha_siembra, fecha_cosecha_estimada } = createCultivoDto;
    try {
      const fincaExiste = await this.fincaRepository.findOne({
        where: {
          id: createCultivoDto.fincaId,
        },
        relations: ['cultivos'],
      });

      if (!fincaExiste) {
        throw new NotFoundException('La finca seleccionada no existe');
      }

      const areaAgricolaFinca = Number(fincaExiste.area_agricola || 0);

      if (areaAgricolaFinca <= 0) {
        throw new BadRequestException(
          'La finca no tiene área agrícola disponible',
        );
      }

      const cultivosActivos = fincaExiste.cultivos.filter(
        (cultivo) => cultivo.isActive === true,
      );

      const areaYaUtilizada = cultivosActivos.reduce(
        (sum, cultivo) => sum + Number(cultivo.area_sembrada),
        0,
      );

      const nuevaAreaTotal =
        areaYaUtilizada + Number(createCultivoDto.area_sembrada);

      if (nuevaAreaTotal > areaAgricolaFinca) {
        throw new BadRequestException(
          `El área sembrada excede el área agrícola disponible. Disponible: ${
            areaAgricolaFinca - areaYaUtilizada
          }`,
        );
      }

      if (fecha_siembra && fecha_cosecha_estimada) {
        const siembra = new Date(fecha_siembra);
        const cosecha = new Date(fecha_cosecha_estimada);

        if (siembra > cosecha) {
          throw new BadRequestException(
            'La fecha de siembra no puede ser mayor que la fecha estimada de cosecha',
          );
        }
      }

      const cultivo = this.cultivoRepository.create({
        ...createCultivoDto,

        unidad_medida: fincaExiste.medida_finca,

        finca: fincaExiste,

        registradoPor: cliente,

        registradoPorId: cliente.id,
      });

      await this.cultivoRepository.save(cultivo);

      return 'Cultivo ingresado correctamente';
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto, cliente: Cliente) {
    const propietarioId = getPropietarioId(cliente);

    const {
      fincaId,
      fechaInicio,
      fechaFin,

      limit = 10,
      offset = 0,
    } = paginationDto;

    const query = this.cultivoRepository
      .createQueryBuilder('cultivo')
      .leftJoinAndSelect('cultivo.finca', 'finca')
      .leftJoin('finca.propietario', 'propietario')
      .where('propietario.id = :propietarioId', {
        propietarioId,
      });

    if (fincaId) {
      query.andWhere('finca.id = :fincaId', { fincaId });
    }

    if (fechaInicio && fechaFin) {
      query.andWhere('cultivo.fecha_siembra BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      });
    }

    query.skip(offset).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      cultivos: data.map((cultivo) => this.mappingCultivos(cultivo)),
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string, cliente: Cliente) {
    const propietarioId = getPropietarioId(cliente);

    try {
      const cultivo = await this.cultivoRepository
        .createQueryBuilder('cultivo')
        .leftJoinAndSelect('cultivo.finca', 'finca')
        .leftJoinAndSelect('cultivo.registradoPor', 'registradoPor')
        .leftJoin('finca.propietario', 'propietario')
        .where('cultivo.id = :id', { id })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .andWhere('cultivo.isActive = true')
        .getOne();

      if (!cultivo) {
        throw new NotFoundException(`No se encontró el cultivo con ID: ${id}`);
      }

      return this.mappingCultivos(cultivo);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateCultivoDto: UpdateCultivoDto,
    cliente: Cliente,
  ) {
    const propietarioId = getPropietarioId(cliente);

    try {
      const cultivoExistente = await this.cultivoRepository
        .createQueryBuilder('cultivo')
        .leftJoinAndSelect('cultivo.finca', 'finca')
        .leftJoin('finca.propietario', 'propietario')
        .where('cultivo.id = :id', { id })
        .andWhere('propietario.id = :propietarioId', { propietarioId })
        .andWhere('cultivo.isActive = true')
        .getOne();

      if (!cultivoExistente) {
        throw new NotFoundException(`No se encontró el cultivo con ID: ${id}`);
      }

      const { area_sembrada, fecha_siembra, fecha_cosecha_estimada, fincaId } =
        updateCultivoDto;

      if (fincaId && fincaId !== cultivoExistente.finca.id) {
        const nuevaFinca = await this.fincaRepository.findOne({
          where: { id: fincaId },
          relations: ['cultivos', 'propietario'],
        });

        if (!nuevaFinca) {
          throw new NotFoundException('La finca seleccionada no existe');
        }

        if (nuevaFinca.propietario.id !== propietarioId) {
          throw new BadRequestException(
            'No tienes permiso para usar esta finca',
          );
        }

        const areaAgricolaFinca = Number(nuevaFinca.area_agricola || 0);
        if (areaAgricolaFinca <= 0) {
          throw new BadRequestException(
            'La finca no tiene área agrícola disponible',
          );
        }

        const cultivosActivos = nuevaFinca.cultivos.filter(
          (cultivo) => cultivo.isActive === true && cultivo.id !== id,
        );

        const areaYaUtilizada = cultivosActivos.reduce(
          (sum, cultivo) => sum + Number(cultivo.area_sembrada),
          0,
        );

        const nuevaArea =
          area_sembrada || Number(cultivoExistente.area_sembrada);
        const nuevaAreaTotal = areaYaUtilizada + Number(nuevaArea);

        if (nuevaAreaTotal > areaAgricolaFinca) {
          throw new BadRequestException(
            `El área sembrada excede el área agrícola disponible en la nueva finca. Disponible: ${areaAgricolaFinca - areaYaUtilizada}`,
          );
        }

        cultivoExistente.finca = nuevaFinca;
        cultivoExistente.unidad_medida = nuevaFinca.medida_finca;
      } else if (
        area_sembrada &&
        area_sembrada !== cultivoExistente.area_sembrada
      ) {
        const fincaActual = await this.fincaRepository.findOne({
          where: { id: cultivoExistente.finca.id },
          relations: ['cultivos'],
        });

        const areaAgricolaFinca = Number(fincaActual.area_agricola || 0);

        const cultivosActivos = fincaActual.cultivos.filter(
          (cultivo) => cultivo.isActive === true && cultivo.id !== id,
        );

        const areaYaUtilizada = cultivosActivos.reduce(
          (sum, cultivo) => sum + Number(cultivo.area_sembrada),
          0,
        );

        const nuevaAreaTotal = areaYaUtilizada + Number(area_sembrada);

        if (nuevaAreaTotal > areaAgricolaFinca) {
          throw new BadRequestException(
            `El área sembrada excede el área agrícola disponible. Disponible: ${areaAgricolaFinca - areaYaUtilizada}`,
          );
        }
      }

      if (fecha_siembra && fecha_cosecha_estimada) {
        const siembra = new Date(fecha_siembra);
        const cosecha = new Date(fecha_cosecha_estimada);

        if (siembra > cosecha) {
          throw new BadRequestException(
            'La fecha de siembra no puede ser mayor que la fecha estimada de cosecha',
          );
        }
      } else if (fecha_siembra && cultivoExistente.fecha_cosecha_estimada) {
        const siembra = new Date(fecha_siembra);
        const cosecha = new Date(cultivoExistente.fecha_cosecha_estimada);

        if (siembra > cosecha) {
          throw new BadRequestException(
            'La fecha de siembra no puede ser mayor que la fecha estimada de cosecha',
          );
        }
      } else if (fecha_cosecha_estimada && cultivoExistente.fecha_siembra) {
        const siembra = new Date(cultivoExistente.fecha_siembra);
        const cosecha = new Date(fecha_cosecha_estimada);

        if (siembra > cosecha) {
          throw new BadRequestException(
            'La fecha de siembra no puede ser mayor que la fecha estimada de cosecha',
          );
        }
      }

      const camposActualizables = [
        'nombre_cultivo',
        'variedad',
        'tipo_cultivo',
        'area_sembrada',
        'unidad_medida',
        'fecha_siembra',
        'fecha_cosecha_estimada',
        'temporada',
        'tipo_suelo',
        'ph_suelo',
        'metodo_siembra',
        'sistema_riego',
        'produccion_estimada',
        'unidad_produccion',
        'costo_semilla',
        'costo_fertilizantes',
        'costo_mano_obra',
        'otros_costos',
        'ingreso_estimado',
        'ganancia_estimada',
        'isActive',
      ];

      for (const campo of camposActualizables) {
        if (updateCultivoDto[campo] !== undefined) {
          cultivoExistente[campo] = updateCultivoDto[campo];
        }
      }

      cultivoExistente.actualizado_por = cliente;
      cultivoExistente.actualizadoPorId = cliente.id;

      await this.cultivoRepository.save(cultivoExistente);

      return 'Cultivo actualizado correctamente';
    } catch (error) {
      throw error;
    }
  }

  private mappingCultivos(cultivo: Cultivo) {
    return {
      id: cultivo.id,
      nombre_cultivo: cultivo.nombre_cultivo,
      tipo_cultivo: cultivo.tipo_cultivo,
      variedad: cultivo.variedad,
      area_sembrada: cultivo.area_sembrada,
      unidad_medida: cultivo.unidad_medida,
      fecha_siembra: cultivo.fecha_siembra,
      fecha_cosecha_estimada: cultivo.fecha_cosecha_estimada,
      temporada: cultivo.temporada,

      tipo_suelo: cultivo.tipo_suelo,
      ph_suelo: cultivo.ph_suelo,
      metodo_siembra: cultivo.metodo_siembra,
      sistema_riego: cultivo.sistema_riego,

      produccion_estimada: cultivo.produccion_estimada,
      unidad_produccion: cultivo.unidad_produccion,

      costo_semilla: cultivo.costo_semilla,
      costo_fertilizantes: cultivo.costo_fertilizantes,
      costo_mano_obra: cultivo.costo_mano_obra,
      otros_costos: cultivo.otros_costos,

      ingreso_estimado: cultivo.ingreso_estimado,
      ganancia_estimada: cultivo.ganancia_estimada,

      isActive: cultivo.isActive,

      finca: cultivo.finca
        ? {
            id: cultivo.finca.id,
            nombre_finca: cultivo.finca.nombre_finca,
            ubicacion: cultivo.finca.ubicacion,
            area_agricola: cultivo.finca.area_agricola,
            medida_finca: cultivo.finca.medida_finca,
          }
        : null,
    };
  }
}
