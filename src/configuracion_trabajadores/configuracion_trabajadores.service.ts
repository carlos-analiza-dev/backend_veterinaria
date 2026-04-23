import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConfiguracionTrabajadoreDto } from './dto/create-configuracion_trabajadore.dto';
import { UpdateConfiguracionTrabajadoreDto } from './dto/update-configuracion_trabajadore.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfiguracionTrabajadore } from './entities/configuracion_trabajadore.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { TipoCliente } from 'src/interfaces/clientes.enums';
import { instanceToPlain } from 'class-transformer';
import { TipoTrabajador } from 'src/interfaces/config-trabajadores.enums';

@Injectable()
export class ConfiguracionTrabajadoresService {
  constructor(
    @InjectRepository(ConfiguracionTrabajadore)
    private readonly configRepo: Repository<ConfiguracionTrabajadore>,

    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async create(propietario: Cliente, dto: CreateConfiguracionTrabajadoreDto) {
    const propietarioId = propietario.id;

    const {
      trabajadorId,
      tipoTrabajador,
      horaEntrada,
      horaSalida,
      diasLaborales,
      diasTrabajadosSemanal,
      fechaBaja,
      motivoBaja,
    } = dto;

    const trabajador = await this.clienteRepo.findOne({
      where: { id: trabajadorId, rol: TipoCliente.TRABAJADOR },
    });

    if (!trabajador) {
      throw new NotFoundException('El trabajador no existe');
    }

    const propietarioDB = await this.clienteRepo.findOne({
      where: { id: propietarioId },
    });

    if (!propietarioDB) {
      throw new NotFoundException('El propietario no existe');
    }

    const existeActiva = await this.configRepo.findOne({
      where: { trabajadorId, activo: true },
    });

    if (existeActiva) {
      throw new BadRequestException(
        'El trabajador ya tiene una configuración activa',
      );
    }

    if (fechaBaja && !motivoBaja) {
      throw new BadRequestException(
        'Debe especificar el motivo de baja si define una fecha de baja',
      );
    }

    if (horaEntrada && horaSalida) {
      if (horaSalida <= horaEntrada) {
        throw new BadRequestException(
          'La hora de salida debe ser mayor que la hora de entrada',
        );
      }
    }

    if (diasLaborales && diasTrabajadosSemanal) {
      if (diasLaborales.length !== diasTrabajadosSemanal) {
        throw new BadRequestException(
          'Los días laborales deben coincidir con los días trabajados semanal',
        );
      }
    }

    if (tipoTrabajador === TipoTrabajador.PARCIAL) {
      if (!diasLaborales || diasLaborales.length === 0) {
        throw new BadRequestException(
          'Un trabajador parcial debe tener días laborales definidos',
        );
      }

      if (diasTrabajadosSemanal >= 6) {
        throw new BadRequestException(
          'Un trabajador parcial no puede trabajar 6 o más días',
        );
      }
    }

    if (tipoTrabajador === TipoTrabajador.PERMANENTE) {
      if (diasTrabajadosSemanal < 5) {
        throw new BadRequestException(
          'Un trabajador permanente debe trabajar al menos 5 días',
        );
      }
    }

    const nuevaConfig = this.configRepo.create({
      ...dto,
      trabajador,
      propietario: propietarioDB,
    });

    await this.configRepo.save(nuevaConfig);

    return {
      message: 'Configuración guardada exitosamente',
    };
  }

  async findAll(cliente: Cliente, paginationDto: PaginationDto) {
    const propietarioId = cliente.id ?? '';
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const query = this.configRepo
        .createQueryBuilder('config')
        .leftJoinAndSelect('config.trabajador', 'trabajador')
        .leftJoinAndSelect('config.propietario', 'propietario')
        .where('config.propietarioId = :propietarioId', { propietarioId })
        .orderBy('config.createdAt', 'DESC')
        .take(limit)
        .skip(offset);

      const [configuraciones, total] = await query.getManyAndCount();

      if (!configuraciones) {
        throw new NotFoundException(
          'No se encontraron configuraciones pendientes para este propietario',
        );
      }

      const config_trabajadores = instanceToPlain(configuraciones);

      return {
        configuraciones: config_trabajadores,
        total,
        limit,
        offset,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    const config = await this.configRepo.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Configuración no encontrada');
    }

    return config;
  }

  async update(
    id: string,
    propietario: Cliente,
    updateConfiguracionTrabajadoreDto: UpdateConfiguracionTrabajadoreDto,
  ) {
    const propietarioId = propietario.id ?? '';

    try {
      const configExistente = await this.configRepo.findOne({
        where: { id, propietarioId },
        relations: ['trabajador', 'propietario'],
      });

      if (!configExistente) {
        throw new NotFoundException('Configuración no encontrada');
      }

      if (
        !configExistente.activo &&
        updateConfiguracionTrabajadoreDto.activo === true
      ) {
        throw new BadRequestException(
          'No se puede reactivar una configuración. Debe crear una nueva.',
        );
      }

      if (updateConfiguracionTrabajadoreDto.tipoTrabajador) {
        const tipo = updateConfiguracionTrabajadoreDto.tipoTrabajador;

        if (
          (tipo === TipoTrabajador.PERMANENTE ||
            tipo === TipoTrabajador.TEMPORAL) &&
          updateConfiguracionTrabajadoreDto.diasLaborales?.length < 5
        ) {
          throw new BadRequestException(
            'Un trabajador permanente o temporal debe tener al menos 5 días laborales',
          );
        }

        if (
          tipo === TipoTrabajador.PARCIAL &&
          (!updateConfiguracionTrabajadoreDto.horaEntrada ||
            !updateConfiguracionTrabajadoreDto.horaSalida)
        ) {
          throw new BadRequestException(
            'Un trabajador parcial debe tener horario definido',
          );
        }
      }

      if (
        updateConfiguracionTrabajadoreDto.horaEntrada &&
        updateConfiguracionTrabajadoreDto.horaSalida
      ) {
        if (
          updateConfiguracionTrabajadoreDto.horaEntrada >=
          updateConfiguracionTrabajadoreDto.horaSalida
        ) {
          throw new BadRequestException(
            'La hora de salida debe ser mayor que la hora de entrada',
          );
        }
      }

      if (
        updateConfiguracionTrabajadoreDto.activo === false &&
        !updateConfiguracionTrabajadoreDto.motivoBaja
      ) {
        throw new BadRequestException(
          'Debe especificar el motivo de baja al desactivar la configuración',
        );
      }

      if (
        updateConfiguracionTrabajadoreDto.activo === false &&
        !updateConfiguracionTrabajadoreDto.fechaBaja
      ) {
        updateConfiguracionTrabajadoreDto.fechaBaja = new Date();
      }

      if (
        updateConfiguracionTrabajadoreDto.trabajadorId &&
        updateConfiguracionTrabajadoreDto.trabajadorId !==
          configExistente.trabajadorId
      ) {
        throw new BadRequestException(
          'No se puede cambiar el trabajador de una configuración existente',
        );
      }

      if (
        updateConfiguracionTrabajadoreDto.fechaBaja &&
        updateConfiguracionTrabajadoreDto.fechaContratacion
      ) {
        const fechaBaja = new Date(updateConfiguracionTrabajadoreDto.fechaBaja);
        const fechaContratacion = new Date(
          updateConfiguracionTrabajadoreDto.fechaContratacion,
        );

        if (fechaBaja <= fechaContratacion) {
          throw new BadRequestException(
            'La fecha de baja debe ser posterior a la fecha de contratación',
          );
        }
      }

      if (
        updateConfiguracionTrabajadoreDto.salarioDiario !== undefined &&
        updateConfiguracionTrabajadoreDto.salarioDiario <= 0
      ) {
        throw new BadRequestException('El salario diario debe ser mayor a 0');
      }

      if (
        updateConfiguracionTrabajadoreDto.factorHoraExtraDiurnas !==
          undefined &&
        (updateConfiguracionTrabajadoreDto.factorHoraExtraDiurnas < 1 ||
          updateConfiguracionTrabajadoreDto.factorHoraExtraDiurnas > 3)
      ) {
        throw new BadRequestException(
          'El factor de hora extra diurna debe estar entre 1 y 3',
        );
      }

      if (
        updateConfiguracionTrabajadoreDto.factorHoraExtraNocturnas !==
          undefined &&
        (updateConfiguracionTrabajadoreDto.factorHoraExtraNocturnas < 1 ||
          updateConfiguracionTrabajadoreDto.factorHoraExtraNocturnas > 3)
      ) {
        throw new BadRequestException(
          'El factor de hora extra nocturnas debe estar entre 1 y 3',
        );
      }

      if (
        updateConfiguracionTrabajadoreDto.factorHoraExtraFestivas !==
          undefined &&
        (updateConfiguracionTrabajadoreDto.factorHoraExtraFestivas < 1 ||
          updateConfiguracionTrabajadoreDto.factorHoraExtraFestivas > 3)
      ) {
        throw new BadRequestException(
          'El factor de hora extra festivas debe estar entre 1 y 3',
        );
      }

      if (
        updateConfiguracionTrabajadoreDto.horasJornadaSemanal !== undefined &&
        (updateConfiguracionTrabajadoreDto.horasJornadaSemanal < 1 ||
          updateConfiguracionTrabajadoreDto.horasJornadaSemanal > 80)
      ) {
        throw new BadRequestException(
          'Las horas semanales deben estar entre 1 y 80',
        );
      }

      if (
        updateConfiguracionTrabajadoreDto.diasTrabajadosSemanal !== undefined &&
        (updateConfiguracionTrabajadoreDto.diasTrabajadosSemanal < 1 ||
          updateConfiguracionTrabajadoreDto.diasTrabajadosSemanal > 7)
      ) {
        throw new BadRequestException(
          'Los días trabajados por semana deben estar entre 1 y 7',
        );
      }

      const camposActualizables = [
        'fechaContratacion',
        'tipoTrabajador',
        'diaDescanso',
        'horaEntrada',
        'horaSalida',
        'diasLaborales',
        'cargo',
        'salarioDiario',
        'factorHoraExtraDiurnas',
        'factorHoraExtraNocturnas',
        'factorHoraExtraFestivas',
        'horasJornadaSemanal',
        'diasTrabajadosSemanal',
        'bonificacionesFijas',
        'deduccionesFijas',
        'activo',
        'fechaBaja',
        'motivoBaja',
      ];

      camposActualizables.forEach((campo) => {
        if (updateConfiguracionTrabajadoreDto[campo] !== undefined) {
          configExistente[campo] = updateConfiguracionTrabajadoreDto[campo];
        }
      });

      const configActualizada = await this.configRepo.save(configExistente);

      return {
        message: 'Configuración actualizada exitosamente',
        configuracion: configActualizada,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} configuracionTrabajadore`;
  }
}
