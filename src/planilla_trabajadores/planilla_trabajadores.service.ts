import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Not } from 'typeorm';
import { PlanillaTrabajadore } from './entities/planilla_trabajadore.entity';
import { DetallePlanillaTrabajadore } from '../detalle_planilla_trabajadores/entities/detalle_planilla_trabajadore.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { JornadaTrabajadore } from '../jornada_trabajadores/entities/jornada_trabajadore.entity';
import { CrearPlanillaTrabajadoresDto } from './dto/create-planilla_trabajadore.dto';
import { UpdatePlanillaTrabajadoreDto } from './dto/update-planilla_trabajadore.dto';
import { EstadoPlanilla, MetodoPago } from 'src/interfaces/planillas.enums';
import { ConfiguracionTrabajadore } from 'src/configuracion_trabajadores/entities/configuracion_trabajadore.entity';
import { PaginationDto } from 'src/common/dto/pagination-common.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class PlanillaTrabajadoresService {
  constructor(
    @InjectRepository(PlanillaTrabajadore)
    private planillaRepo: Repository<PlanillaTrabajadore>,
    @InjectRepository(DetallePlanillaTrabajadore)
    private detalleRepo: Repository<DetallePlanillaTrabajadore>,
    @InjectRepository(ConfiguracionTrabajadore)
    private configRepo: Repository<ConfiguracionTrabajadore>,
    @InjectRepository(JornadaTrabajadore)
    private jornadaRepo: Repository<JornadaTrabajadore>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  async create(propietario: Cliente, createDto: CrearPlanillaTrabajadoresDto) {
    const propietarioId = propietario.id;

    const existePlanilla = await this.planillaRepo.findOne({
      where: {
        propietarioId,
        fechaInicio: createDto.fechaInicio,
        fechaFin: createDto.fechaFin,
        estado: Not(EstadoPlanilla.ANULADA),
      },
    });

    if (existePlanilla) {
      throw new BadRequestException('Ya existe una planilla para este período');
    }

    const planilla = this.planillaRepo.create({
      ...createDto,
      propietarioId,
      estado: EstadoPlanilla.BORRADOR,
    });

    return await this.planillaRepo.save(planilla);
  }

  async findAll(propietario: Cliente, paginationDto: PaginationDto) {
    const {
      estado,
      limit = 10,
      offset = 0,
      fechaInicio,
      fechaFin,
      mes,
    } = paginationDto;

    const propietarioId = propietario.id ?? '';

    const query = this.planillaRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.detalles', 'd')
      .leftJoinAndSelect('d.trabajador', 't')
      .where('p.propietarioId = :propietarioId', { propietarioId });

    if (estado) {
      query.andWhere('p.estado = :estado', { estado });
    }

    if (mes) {
      const [year, month] = mes.split('-').map(Number);

      const inicioMes = new Date(year, month - 1, 1);
      const finMes = new Date(year, month, 0);

      query.andWhere('p.fechaInicio BETWEEN :inicioMes AND :finMes', {
        inicioMes,
        finMes,
      });
    } else if (fechaInicio && fechaFin) {
      query.andWhere('p.fechaInicio BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      });
    } else if (fechaInicio) {
      query.andWhere('p.fechaInicio >= :inicio', {
        inicio: fechaInicio,
      });
    } else if (fechaFin) {
      query.andWhere('p.fechaInicio <= :fin', {
        fin: fechaFin,
      });
    }

    query.orderBy('p.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      planillas: instanceToPlain(data),
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string, propietarioId: string) {
    const planilla = await this.planillaRepo.findOne({
      where: { id, propietarioId },
      relations: ['detalles', 'detalles.trabajador', 'propietario'],
    });

    if (!planilla) {
      throw new NotFoundException('Planilla no encontrada');
    }

    return planilla;
  }

  async update(
    id: string,
    propietarioId: string,
    updateDto: UpdatePlanillaTrabajadoreDto,
  ) {
    const planilla = await this.findOne(id, propietarioId);

    if (planilla.estado !== EstadoPlanilla.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden editar planillas en estado BORRADOR',
      );
    }

    Object.assign(planilla, updateDto);
    return await this.planillaRepo.save(planilla);
  }

  async remove(id: string, propietarioId: string) {
    const planilla = await this.findOne(id, propietarioId);

    if (planilla.estado !== EstadoPlanilla.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden eliminar planillas en estado BORRADOR',
      );
    }

    await this.detalleRepo.delete({ planillaId: id });

    await this.planillaRepo.remove(planilla);

    return { message: 'Planilla eliminada exitosamente' };
  }

  async generarPlanillaDesdeJornadas(id: string, propietarioId: string) {
    const planilla = await this.findOne(id, propietarioId);

    if (planilla.estado !== EstadoPlanilla.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden generar planillas en estado BORRADOR',
      );
    }

    await this.detalleRepo.delete({ planillaId: id });

    const jornadas = await this.jornadaRepo.find({
      where: {
        propietarioId,
        fecha: Between(planilla.fechaInicio, planilla.fechaFin),
      },
      relations: ['trabajador'],
    });

    if (jornadas.length === 0) {
      throw new BadRequestException(
        'No hay jornadas registradas en este período',
      );
    }

    const jornadasPorTrabajador = new Map();
    for (const jornada of jornadas) {
      if (!jornadasPorTrabajador.has(jornada.trabajadorId)) {
        jornadasPorTrabajador.set(jornada.trabajadorId, []);
      }
      jornadasPorTrabajador.get(jornada.trabajadorId).push(jornada);
    }

    const detalles = [];
    for (const [trabajadorId, jornadasTrabajador] of jornadasPorTrabajador) {
      const detalle = await this.generarDetallePlanilla(
        planilla,
        trabajadorId,
        jornadasTrabajador,
        propietarioId,
      );
      detalles.push(detalle);
    }

    await this.actualizarTotalesPlanilla(id);

    return {
      message: 'Planilla generada exitosamente',
      totalTrabajadores: detalles.length,
      planilla: await this.findOne(id, propietarioId),
    };
  }

  private async generarDetallePlanilla(
    planilla: PlanillaTrabajadore,
    trabajadorId: string,
    jornadas: JornadaTrabajadore[],
    propietarioId: string,
  ) {
    const configuracion = await this.configRepo.findOne({
      where: {
        trabajadorId,
        propietarioId,
        activo: true,
        fechaContratacion: Between(
          new Date('1900-01-01'),
          planilla.fechaInicio,
        ),
      },
    });

    if (!configuracion) {
      throw new BadRequestException(
        `El trabajador ${jornadas[0]?.trabajador?.nombre || trabajadorId} no tiene una configuración activa para este período`,
      );
    }

    const diasTrabajados = jornadas.filter((j) => j.trabajo).length;
    const ausenciasInjustificadas = jornadas.filter((j) => !j.trabajo).length;

    const salarioBase = diasTrabajados * Number(configuracion.salarioDiario);

    const totalHorasExtraDiurnas = jornadas.reduce(
      (sum, j) => sum + Number(j.horasExtrasDiurnas),
      0,
    );
    const totalHorasExtraNocturnas = jornadas.reduce(
      (sum, j) => sum + Number(j.horasExtrasNocturnas),
      0,
    );
    const totalHorasExtraFestivas = jornadas.reduce(
      (sum, j) => sum + Number(j.horasExtrasFestivas),
      0,
    );

    const horasPorDia =
      configuracion.horasJornadaSemanal / configuracion.diasTrabajadosSemanal;
    const valorHoraNormal = Number(configuracion.salarioDiario) / horasPorDia;

    const valorHoraExtraDiurna =
      valorHoraNormal * Number(configuracion.factorHoraExtraDiurnas || 1.5);
    const valorHoraExtraNocturna =
      valorHoraNormal * Number(configuracion.factorHoraExtraNocturnas || 1.75);
    const valorHoraExtraFestiva =
      valorHoraNormal * Number(configuracion.factorHoraExtraFestivas || 2.0);

    const totalHorasExtras =
      totalHorasExtraDiurnas * valorHoraExtraDiurna +
      totalHorasExtraNocturnas * valorHoraExtraNocturna +
      totalHorasExtraFestivas * valorHoraExtraFestiva;

    const fechaInicio =
      planilla.fechaInicio instanceof Date
        ? planilla.fechaInicio
        : new Date(planilla.fechaInicio);
    const fechaFin =
      planilla.fechaFin instanceof Date
        ? planilla.fechaFin
        : new Date(planilla.fechaFin);

    const diasEnPeriodo =
      Math.ceil(
        (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    const proporcionPeriodo = diasEnPeriodo / 30;

    const bonificaciones = (configuracion.bonificacionesFijas || []).reduce(
      (sum, b) => sum + b.montoMensual * proporcionPeriodo,
      0,
    );

    const deducciones = (configuracion.deduccionesFijas || []).reduce(
      (sum, d) => sum + d.montoMensual * proporcionPeriodo,
      0,
    );

    const totalDevengado = salarioBase + totalHorasExtras + bonificaciones;
    const totalDeduccionesAplicadas = deducciones;
    const totalAPagar = totalDevengado - totalDeduccionesAplicadas;

    const detalle = this.detalleRepo.create({
      planillaId: planilla.id,
      trabajadorId,
      salarioDiario: Number(configuracion.salarioDiario),
      valorHoraExtraDiurna: valorHoraExtraDiurna,
      valorHoraExtraNocturna: valorHoraExtraNocturna,
      valorHoraExtraFestiva: valorHoraExtraFestiva,
      diasTrabajados,
      ausenciasInjustificadas,
      horasExtraDiurnas: totalHorasExtraDiurnas,
      horasExtraNocturnas: totalHorasExtraNocturnas,
      horasExtraFestivas: totalHorasExtraFestivas,
      totalHorasExtras,
      bonificaciones,
      deducciones,
      salarioBase,
      totalDevengado,
      totalDeduccionesAplicadas,
      totalAPagar,
    });

    return await this.detalleRepo.save(detalle);
  }

  private async actualizarTotalesPlanilla(planillaId: string) {
    const detalles = await this.detalleRepo.find({
      where: { planillaId },
    });

    const totalSalarios = detalles.reduce(
      (sum, d) => sum + Number(d.salarioBase),
      0,
    );
    const totalHorasExtras = detalles.reduce(
      (sum, d) => sum + Number(d.totalHorasExtras),
      0,
    );
    const totalBonificaciones = detalles.reduce(
      (sum, d) => sum + Number(d.bonificaciones),
      0,
    );
    const totalDeducciones = detalles.reduce(
      (sum, d) => sum + Number(d.deducciones),
      0,
    );
    const totalNeto = detalles.reduce(
      (sum, d) => sum + Number(d.totalAPagar),
      0,
    );

    await this.planillaRepo.update(planillaId, {
      totalSalarios,
      totalHorasExtras,
      totalBonificaciones,
      totalDeducciones,
      totalNeto,
    });
  }

  async confirmarPlanilla(id: string, propietarioId: string) {
    const planilla = await this.findOne(id, propietarioId);

    if (planilla.estado !== EstadoPlanilla.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden confirmar planillas en estado BORRADOR',
      );
    }

    if (!planilla.detalles || planilla.detalles.length === 0) {
      throw new BadRequestException(
        'No se puede confirmar una planilla sin detalles',
      );
    }

    planilla.estado = EstadoPlanilla.CONFIRMADA;
    await this.planillaRepo.save(planilla);

    return { message: 'Planilla confirmada exitosamente', planilla };
  }

  async registrarPagos(
    id: string,
    propietarioId: string,
    pagos: { detalleId: string; metodoPago: MetodoPago }[],
  ) {
    const planilla = await this.findOne(id, propietarioId);

    if (planilla.estado !== EstadoPlanilla.CONFIRMADA) {
      throw new BadRequestException(
        'La planilla debe estar CONFIRMADA para registrar pagos',
      );
    }

    for (const pago of pagos) {
      const detalle = await this.detalleRepo.findOne({
        where: { id: pago.detalleId, planillaId: id },
      });

      if (!detalle) {
        throw new NotFoundException(`Detalle ${pago.detalleId} no encontrado`);
      }

      if (detalle.pagado) {
        throw new BadRequestException(
          `El trabajador ${detalle.trabajador?.nombre} ya fue pagado`,
        );
      }

      detalle.pagado = true;
      detalle.fechaPago = new Date();
      detalle.metodoPago = pago.metodoPago;
      await this.detalleRepo.save(detalle);
    }

    const detalles = await this.detalleRepo.find({ where: { planillaId: id } });
    const todosPagados = detalles.every((d) => d.pagado);

    if (todosPagados) {
      await this.planillaRepo.update(id, { estado: EstadoPlanilla.PAGADA });
    }

    return {
      message: 'Pagos registrados exitosamente',
      planilla: await this.findOne(id, propietarioId),
    };
  }

  async anularPlanilla(id: string, propietarioId: string, motivo: string) {
    const planilla = await this.findOne(id, propietarioId);

    if (planilla.estado === EstadoPlanilla.PAGADA) {
      throw new BadRequestException(
        'No se puede anular una planilla ya pagada',
      );
    }

    planilla.estado = EstadoPlanilla.ANULADA;
    planilla.observaciones = `${planilla.observaciones || ''} - ANULADA: ${motivo}`;

    await this.planillaRepo.save(planilla);

    return { message: 'Planilla anulada exitosamente', planilla };
  }

  async obtenerDetallePlanilla(id: string, propietarioId: string) {
    const planilla = await this.findOne(id, propietarioId);

    const resumen = {
      totalTrabajadores: planilla.detalles.length,
      totalPagados: planilla.detalles.filter((d) => d.pagado).length,
      totalPendientes: planilla.detalles.filter((d) => !d.pagado).length,
      montoTotalPagado: planilla.detalles
        .filter((d) => d.pagado)
        .reduce((sum, d) => sum + Number(d.totalAPagar), 0),
      montoTotalPendiente: planilla.detalles
        .filter((d) => !d.pagado)
        .reduce((sum, d) => sum + Number(d.totalAPagar), 0),
    };

    return {
      planilla: instanceToPlain(planilla),
      resumen,
    };
  }
}
