import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Cultivo } from './entities/cultivo.entity';
import { MailService } from 'src/mail/mail.service';
import { formatDateLocal } from '../helpers/dateTimeLocal';
import {
  CultivoCosechaProximaDTO,
  CultivoCosechaVencidaDTO,
} from 'src/interfaces/alertas/cultivo-cosecha-proxima.dto';
import { formatDateISO } from '../helpers/format-date';

const DIAS_ALERTA = [5, 10, 15];

@Injectable()
export class AlertasCultivosService {
  private readonly logger = new Logger(AlertasCultivosService.name);

  constructor(
    @InjectRepository(Cultivo)
    private cultivoRepo: Repository<Cultivo>,

    private mailService: MailService,
  ) {}

  /**
   * Cosechas próximas (<= 15 días)
   * Se ejecuta todos los días a las 7:00 AM (hora Honduras)
   */

  @Cron(CronExpression.EVERY_DAY_AT_7AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarCosechasProximas() {
    this.logger.log('Iniciando verificación de cosechas próximas...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fecha7Dias = new Date(hoy);
      fecha7Dias.setDate(fecha7Dias.getDate() + 7);

      const fecha1Dia = new Date(hoy);
      fecha1Dia.setDate(fecha1Dia.getDate() + 1);

      const cultivos = await this.cultivoRepo
        .createQueryBuilder('cultivo')
        .leftJoinAndSelect('cultivo.finca', 'finca')
        .leftJoinAndSelect('cultivo.registradoPor', 'propietario')
        .where('cultivo.isActive = :activo', { activo: true })
        .andWhere('cultivo.fecha_cosecha_estimada IS NOT NULL')
        .andWhere(`cultivo.fecha_cosecha_estimada IN (:...fechas)`, {
          fechas: [formatDateISO(fecha7Dias), formatDateISO(fecha1Dia)],
        })
        .getMany();

      if (cultivos.length === 0) {
        return;
      }

      const porPropietario = this.agruparPorPropietario(cultivos);

      for (const [, cultivosCliente] of porPropietario) {
        await this.enviarAlertaCosechasProximas(cultivosCliente, hoy);
      }

      this.logger.log('Verificación de cosechas próximas completada');
    } catch (error) {
      this.logger.error('Error en alerta de cosechas próximas', error);
    }
  }

  /**
   * Cosecha vencida (5, 10 y 15 días después)
   * Se ejecuta todos los días a las 7:00 AM (hora Honduras)
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarCosechasVencidas() {
    this.logger.log('Iniciando verificación de cosechas vencidas...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechasObjetivo = DIAS_ALERTA.map((dias) => {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - dias);
        return formatDateISO(fecha);
      });

      const cultivos = await this.cultivoRepo
        .createQueryBuilder('cultivo')
        .leftJoinAndSelect('cultivo.finca', 'finca')
        .leftJoinAndSelect('cultivo.registradoPor', 'propietario')
        .where('cultivo.isActive = :activo', { activo: true })
        .andWhere('cultivo.fecha_cosecha_estimada IS NOT NULL')
        .andWhere('cultivo.fecha_cosecha_estimada IN (:...fechas)', {
          fechas: fechasObjetivo,
        })
        .getMany();

      if (cultivos.length === 0) {
        return;
      }

      const porPropietario = this.agruparPorPropietario(cultivos);

      for (const [, cultivosCliente] of porPropietario) {
        await this.enviarAlertaCosechasVencidas(cultivosCliente, hoy);
      }

      this.logger.log('Verificación de cosechas vencidas completada');
    } catch (error) {
      this.logger.error(`Error en alerta de cosechas vencidas`);
    }
  }

  private agruparPorPropietario(cultivos: Cultivo[]): Map<string, Cultivo[]> {
    const mapa = new Map<string, Cultivo[]>();

    for (const cultivo of cultivos) {
      const key = cultivo.registradoPorId;
      if (!key) continue;

      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(cultivo);
    }

    return mapa;
  }

  private async enviarAlertaCosechasProximas(cultivos: Cultivo[], hoy: Date) {
    try {
      const propietario = cultivos[0].registradoPor;

      if (!propietario?.email) {
        return;
      }

      const formateadas: CultivoCosechaProximaDTO[] = cultivos.map((c) =>
        this.formatearCultivo(c, hoy),
      );

      await this.mailService.sendCosechasProximas(
        propietario.email,
        propietario.nombre || 'Cliente',
        formateadas.length,
        formateadas,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de cosechas próximas`);
    }
  }

  private async enviarAlertaCosechasVencidas(cultivos: Cultivo[], hoy: Date) {
    try {
      const propietario = cultivos[0].registradoPor;

      if (!propietario?.email) {
        return;
      }

      const formateadas: CultivoCosechaVencidaDTO[] = cultivos.map((c) =>
        this.formatearCultivoVencido(c, hoy),
      );

      await this.mailService.sendCosechasVencidas(
        propietario.email,
        propietario.nombre || 'Cliente',
        formateadas.length,
        formateadas,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de cosechas vencidas`);
    }
  }

  private formatearCultivo(c: Cultivo, hoy: Date): CultivoCosechaProximaDTO {
    const fechaCosecha = this.parseDate(c.fecha_cosecha_estimada);
    fechaCosecha.setHours(0, 0, 0, 0);

    const diasRestantes = Math.round(
      (fechaCosecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    const fechaSiembra = c.fecha_siembra
      ? this.parseDate(c.fecha_siembra)
      : null;

    return {
      id: c.id,
      nombre_cultivo: c.nombre_cultivo,
      variedad: c.variedad || null,
      tipo_cultivo: c.tipo_cultivo,
      finca: c.finca?.nombre_finca || 'N/D',
      area_sembrada: Number(c.area_sembrada) || 0,
      unidad_medida: c.unidad_medida || null,
      fecha_siembra: fechaSiembra ? formatDateLocal(fechaSiembra) : null,
      fecha_cosecha_estimada: formatDateLocal(fechaCosecha),
      dias_restantes: diasRestantes,
      produccion_estimada: c.produccion_estimada
        ? Number(c.produccion_estimada)
        : null,
      unidad_produccion: c.unidad_produccion || null,
      temporada: c.temporada || null,
      es_hoy: diasRestantes === 0,
      es_esta_semana: diasRestantes <= 7,
    };
  }

  private formatearCultivoVencido(
    c: Cultivo,
    hoy: Date,
  ): CultivoCosechaVencidaDTO {
    const fechaCosecha = this.parseDate(c.fecha_cosecha_estimada);
    fechaCosecha.setHours(0, 0, 0, 0);

    const diasVencida = Math.round(
      (hoy.getTime() - fechaCosecha.getTime()) / (1000 * 60 * 60 * 24),
    );

    const fechaSiembra = c.fecha_siembra
      ? this.parseDate(c.fecha_siembra)
      : null;

    return {
      id: c.id,
      nombre_cultivo: c.nombre_cultivo,
      variedad: c.variedad || null,
      tipo_cultivo: c.tipo_cultivo,
      finca: c.finca?.nombre_finca || 'N/D',
      area_sembrada: Number(c.area_sembrada) || 0,
      unidad_medida: c.unidad_medida || null,
      fecha_siembra: fechaSiembra ? formatDateLocal(fechaSiembra) : null,
      fecha_cosecha_estimada: formatDateLocal(fechaCosecha),
      dias_vencida: diasVencida,
      produccion_estimada: c.produccion_estimada
        ? Number(c.produccion_estimada)
        : null,
      unidad_produccion: c.unidad_produccion || null,
      temporada: c.temporada || null,
      es_5_dias: diasVencida === 5,
      es_10_dias: diasVencida === 10,
      es_15_dias: diasVencida === 15,
      es_urgente: diasVencida >= 15,
    };
  }

  private parseDate(value: Date | string): Date {
    if (value instanceof Date) return new Date(value);

    const [year, month, day] = value
      .toString()
      .split('T')[0]
      .split('-')
      .map(Number);

    return new Date(year, month - 1, day);
  }
}
