import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ActividadesDiaria } from './entities/actividades_diaria.entity';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { MailService } from 'src/mail/mail.service';
import { EstadoActividad } from 'src/interfaces/actividades/actividaes.enums';
import { formatDateLocal } from '../helpers/dateTimeLocal';
import {
  ActividadProximaDTO,
  ActividadVencidaDTO,
} from 'src/interfaces/alertas/actividad-alerta.dto';

@Injectable()
export class ActividadesAlertasService {
  private readonly logger = new Logger(ActividadesAlertasService.name);

  constructor(
    @InjectRepository(ActividadesDiaria)
    private actividadRepo: Repository<ActividadesDiaria>,

    private mailService: MailService,
  ) {}

  // ==================================================================
  // Actividades próximas a vencer (hoy o mañana)
  // ==================================================================
  @Cron(CronExpression.EVERY_DAY_AT_7AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarActividadesProximas() {
    this.logger.log('Iniciando verificación de actividades próximas...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      const actividades = await this.actividadRepo
        .createQueryBuilder('actividad')
        .leftJoinAndSelect('actividad.finca', 'finca')
        .leftJoinAndSelect('actividad.trabajador', 'trabajador')
        .leftJoinAndSelect('actividad.propietario', 'propietario')
        .where('actividad.fecha IN (:...fechas)', {
          fechas: [this.toISODate(hoy), this.toISODate(manana)],
        })
        .andWhere('actividad.estado IN (:...estados)', {
          estados: [EstadoActividad.PENDIENTE, EstadoActividad.EN_PROCESO],
        })
        .andWhere('actividad.completada = :completada', { completada: false })
        .getMany();

      if (actividades.length === 0) {
        this.logger.log('No hay actividades próximas para alertar');
        return;
      }

      this.logger.log(
        `Se encontraron ${actividades.length} actividades próximas`,
      );

      const porPropietario = this.agruparPorPropietario(actividades);

      for (const [, actividadesCliente] of porPropietario) {
        await this.enviarAlertaActividadesProximas(actividadesCliente);
      }

      this.logger.log('Verificación de actividades próximas completada');
    } catch (error) {
      this.logger.error(`Error en alerta de actividades próximas`);
    }
  }

  // ==================================================================
  //Actividades vencidas sin completar
  // ==================================================================
  @Cron(CronExpression.EVERY_DAY_AT_8AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarActividadesVencidas() {
    this.logger.log('Iniciando verificación de actividades vencidas...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const actividades = await this.actividadRepo
        .createQueryBuilder('actividad')
        .leftJoinAndSelect('actividad.finca', 'finca')
        .leftJoinAndSelect('actividad.trabajador', 'trabajador')
        .leftJoinAndSelect('actividad.propietario', 'propietario')
        .where('actividad.fecha < :hoy', {
          hoy: this.toISODate(hoy),
        })
        .andWhere('actividad.estado NOT IN (:...estados)', {
          estados: [EstadoActividad.COMPLETADA, EstadoActividad.CANCELADA],
        })
        .andWhere('actividad.completada = :completada', { completada: false })
        .getMany();

      if (actividades.length === 0) {
        this.logger.log('No hay actividades vencidas para alertar');
        return;
      }

      this.logger.log(
        `Se encontraron ${actividades.length} actividades vencidas`,
      );

      const porPropietario = this.agruparPorPropietario(actividades);

      for (const [, actividadesCliente] of porPropietario) {
        await this.enviarAlertaActividadesVencidas(actividadesCliente);
      }

      this.logger.log('Verificación de actividades vencidas completada');
    } catch (error) {
      this.logger.error(`Error en alerta de actividades vencidas`);
    }
  }

  private agruparPorPropietario(
    actividades: ActividadesDiaria[],
  ): Map<string, ActividadesDiaria[]> {
    const mapa = new Map<string, ActividadesDiaria[]>();

    for (const actividad of actividades) {
      const key = actividad.propietarioId;
      if (!key) continue;

      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(actividad);
    }

    return mapa;
  }

  // ---------- Alerta próximas ----------
  private async enviarAlertaActividadesProximas(
    actividades: ActividadesDiaria[],
  ) {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // ---------- Correo al PROPIETARIO ----------
      const propietario = actividades[0].propietario;

      if (propietario?.email) {
        const formateadas: ActividadProximaDTO[] = actividades.map((a) =>
          this.formatearActividadProxima(a, hoy),
        );

        await this.mailService.sendActividadesProximas(
          propietario.email,
          propietario.nombre || 'Cliente',
          formateadas.length,
          formateadas,
        );
      } else {
        this.logger.warn(`Propietario ${propietario?.id} no tiene email`);
      }

      // ---------- Correo a cada TRABAJADOR ----------
      const porTrabajador = this.agruparPorTrabajador(actividades);

      for (const [trabajadorId, actividadesTrabajador] of porTrabajador) {
        const trabajador = actividadesTrabajador[0].trabajador;

        if (!trabajador?.email) {
          continue;
        }

        const formateadas: ActividadProximaDTO[] = actividadesTrabajador.map(
          (a) => this.formatearActividadProxima(a, hoy),
        );

        await this.mailService.sendActividadesProximas(
          trabajador.email,
          trabajador.nombre || 'Trabajador',
          formateadas.length,
          formateadas,
        );
      }
    } catch (error) {
      this.logger.error(`Error enviando alerta de actividades próximas`);
    }
  }

  // ---------- Alerta vencidas ----------
  private async enviarAlertaActividadesVencidas(
    actividades: ActividadesDiaria[],
  ) {
    try {
      const propietario = actividades[0].propietario;

      if (!propietario?.email) {
        this.logger.warn(`Propietario ${propietario?.id} no tiene email`);
        return;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const formateadas: ActividadVencidaDTO[] = actividades.map((a) => {
        const fechaActividad = new Date(a.fecha);
        fechaActividad.setHours(0, 0, 0, 0);

        const diasVencida = Math.floor(
          (hoy.getTime() - fechaActividad.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          id: a.id,
          finca: a.finca?.nombre_finca || 'N/D',
          trabajador: this.nombreCliente(a.trabajador),
          tipo: a.tipo,
          fecha: formatDateLocal(fechaActividad),
          estado: a.estado,
          frecuencia: a.frecuencia,
          descripcion: a.descripcion || null,
          dias_vencida: diasVencida,
        };
      });

      await this.mailService.sendActividadesVencidas(
        propietario.email,
        propietario.nombre || 'Cliente',
        formateadas.length,
        formateadas,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de actividades vencidas`);
    }
  }

  private nombreCliente(cliente?: Cliente): string {
    if (!cliente) return 'N/D';
    return (
      cliente.nombre ||
      `${cliente.nombre || ''}`.trim() ||
      cliente.email ||
      'N/D'
    );
  }

  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatearActividadProxima(
    a: ActividadesDiaria,
    hoy: Date,
  ): ActividadProximaDTO {
    const [year, month, day] = a.fecha
      .toString()
      .split('T')[0]
      .split('-')
      .map(Number);

    const fechaActividad = new Date(year, month - 1, day);
    fechaActividad.setHours(0, 0, 0, 0);

    const diasRestantes = Math.round(
      (fechaActividad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      id: a.id,
      finca: a.finca?.nombre_finca || 'N/D',
      trabajador: this.nombreCliente(a.trabajador),
      tipo: a.tipo,
      fecha: formatDateLocal(fechaActividad),
      estado: a.estado,
      frecuencia: a.frecuencia,
      descripcion: a.descripcion || null,
      dias_restantes: diasRestantes,
      es_hoy: diasRestantes === 0,
      es_manana: diasRestantes === 1,
    };
  }

  private agruparPorTrabajador(
    actividades: ActividadesDiaria[],
  ): Map<string, ActividadesDiaria[]> {
    const mapa = new Map<string, ActividadesDiaria[]>();

    for (const actividad of actividades) {
      const key = actividad.trabajadorId;
      if (!key) continue;

      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(actividad);
    }

    return mapa;
  }
}
