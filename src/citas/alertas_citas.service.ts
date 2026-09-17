import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cita } from './entities/cita.entity';
import { MailService } from 'src/mail/mail.service';
import { EstadoCita } from 'src/interfaces/estados_citas';
import { formatDateLocal } from '../helpers/dateTimeLocal';
import { formatDateISO } from '../helpers/format-date';
import {
  CitaRecordatorioDTO,
  CitaVencidaDTO,
} from 'src/interfaces/alertas/cita-alerta.dto';
import { Medico } from 'src/medicos/entities/medico.entity';

@Injectable()
export class AlertasCitasService {
  private readonly logger = new Logger(AlertasCitasService.name);

  constructor(
    @InjectRepository(Cita)
    private citaRepo: Repository<Cita>,

    private mailService: MailService,
  ) {}

  // ==================================================================
  // Recordatorio (cita mañana)
  // ==================================================================
  @Cron('0 16 * * *', {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarCitasManana() {
    this.logger.log('Iniciando verificación de citas para mañana...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      const citas = await this.citaRepo
        .createQueryBuilder('cita')
        .leftJoinAndSelect('cita.cliente', 'cliente')
        .leftJoinAndSelect('cita.finca', 'finca')
        .leftJoinAndSelect('cita.medico', 'medico')
        .leftJoinAndSelect('medico.usuario', 'usuario')
        .leftJoinAndSelect('cita.subServicio', 'subServicio')
        .leftJoinAndSelect('cita.animales', 'animales')
        .where('cita.fecha = :manana', { manana: formatDateISO(manana) })
        .andWhere('cita.estado IN (:...estados)', {
          estados: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA],
        })
        .orderBy('cita.horaInicio', 'ASC')
        .getMany();

      if (citas.length === 0) {
        return;
      }

      const porCliente = this.agruparPorCliente(citas);

      for (const [, citasCliente] of porCliente) {
        await this.enviarRecordatorioCitas(citasCliente, 'manana');
      }

      this.logger.log('Verificación de citas para mañana completada');
    } catch (error) {
      this.logger.error(`Error en alerta de citas para mañana`);
    }
  }

  // ==================================================================
  // Cita es hoy
  // ==================================================================
  @Cron(CronExpression.EVERY_DAY_AT_7AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarCitasHoy() {
    this.logger.log('Iniciando verificación de citas para hoy...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const citas = await this.citaRepo
        .createQueryBuilder('cita')
        .leftJoinAndSelect('cita.cliente', 'cliente')
        .leftJoinAndSelect('cita.finca', 'finca')
        .leftJoinAndSelect('cita.medico', 'medico')
        .leftJoinAndSelect('medico.usuario', 'usuario')
        .leftJoinAndSelect('cita.subServicio', 'subServicio')
        .leftJoinAndSelect('cita.animales', 'animales')
        .where('cita.fecha = :hoy', { hoy: formatDateISO(hoy) })
        .andWhere('cita.estado IN (:...estados)', {
          estados: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA],
        })
        .orderBy('cita.horaInicio', 'ASC')
        .getMany();

      if (citas.length === 0) {
        return;
      }

      const porCliente = this.agruparPorCliente(citas);

      for (const [, citasCliente] of porCliente) {
        await this.enviarRecordatorioCitas(citasCliente, 'hoy');
      }

      this.logger.log('Verificación de citas para hoy completada');
    } catch (error) {
      this.logger.error(`Error en alerta de citas para hoy`);
    }
  }

  // ==================================================================
  // ALERTA 3: Citas vencidas sin completar
  // ==================================================================
  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarCitasVencidas() {
    this.logger.log('Iniciando verificación de citas vencidas...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const hace5Dias = new Date(hoy);
      hace5Dias.setDate(hace5Dias.getDate() - 5);

      const hace10Dias = new Date(hoy);
      hace10Dias.setDate(hace10Dias.getDate() - 10);

      const citas = await this.citaRepo
        .createQueryBuilder('cita')
        .leftJoinAndSelect('cita.cliente', 'cliente')
        .leftJoinAndSelect('cita.finca', 'finca')
        .leftJoinAndSelect('cita.medico', 'medico')
        .leftJoinAndSelect('medico.usuario', 'usuario')
        .leftJoinAndSelect('cita.subServicio', 'subServicio')
        .leftJoinAndSelect('cita.animales', 'animales')
        .where('cita.fecha IN (:...fechas)', {
          fechas: [formatDateISO(hace5Dias), formatDateISO(hace10Dias)],
        })
        .andWhere('cita.estado IN (:...estados)', {
          estados: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA],
        })
        .orderBy('cita.fecha', 'ASC')
        .getMany();

      if (citas.length === 0) {
        return;
      }

      const porCliente = this.agruparPorCliente(citas);

      for (const [, citasCliente] of porCliente) {
        await this.enviarAlertaCitasVencidas(citasCliente, hoy);
      }

      this.logger.log('Verificación de citas vencidas completada');
    } catch (error) {
      this.logger.error('Error en alerta de citas vencidas', error);
    }
  }

  // ==================================================================
  // Helpers
  // ==================================================================
  private agruparPorCliente(citas: Cita[]): Map<string, Cita[]> {
    const mapa = new Map<string, Cita[]>();

    for (const cita of citas) {
      const key = cita.cliente?.id;
      if (!key) continue;

      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(cita);
    }

    return mapa;
  }

  // ---------- Recordatorio (hoy / mañana) ----------
  private async enviarRecordatorioCitas(citas: Cita[], tipo: 'hoy' | 'manana') {
    try {
      const cliente = citas[0].cliente;

      if (!cliente?.email) {
        return;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const formateadas: CitaRecordatorioDTO[] = citas.map((c) =>
        this.formatearCitaRecordatorio(c, tipo),
      );

      await this.mailService.sendRecordatorioCitas(
        cliente.email,
        cliente.nombre || 'Cliente',
        formateadas.length,
        formateadas,
        tipo,
      );
    } catch (error) {
      this.logger.error(`Error enviando recordatorio de citas`);
    }
  }

  private formatearCitaRecordatorio(
    c: Cita,
    tipo: 'hoy' | 'manana',
  ): CitaRecordatorioDTO {
    const fecha = this.parseDate(c.fecha);

    return {
      id: c.id,
      codigo: c.codigo,
      fecha: formatDateLocal(fecha),
      horaInicio: c.horaInicio,
      horaFin: c.horaFin,
      duracion: c.duracion,
      finca: c.finca?.nombre_finca || 'N/D',
      medico: this.nombreMedico(c.medico),
      subServicio: c.subServicio?.nombre || 'N/D',
      cantidadAnimales: c.cantidadAnimales,
      animales: (c.animales || []).map((a) => this.nombreAnimal(a)),
      totalPagar: Number(c.totalPagar) || 0,
      estado: c.estado,
      motivoCancelacion: c.motivoCancelacion || null,

      es_hoy: tipo === 'hoy',
      es_manana: tipo === 'manana',
    };
  }

  // ---------- Vencidas ----------
  private async enviarAlertaCitasVencidas(citas: Cita[], hoy: Date) {
    try {
      const cliente = citas[0].cliente;

      if (!cliente?.email) {
        return;
      }

      const formateadas: CitaVencidaDTO[] = citas.map((c) =>
        this.formatearCitaVencida(c, hoy),
      );

      await this.mailService.sendCitasVencidas(
        cliente.email,
        cliente.nombre || 'Cliente',
        formateadas.length,
        formateadas,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de citas vencidas`);
    }
  }

  private formatearCitaVencida(c: Cita, hoy: Date): CitaVencidaDTO {
    const fecha = this.parseDate(c.fecha);
    fecha.setHours(0, 0, 0, 0);

    const diasVencida = Math.round(
      (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      id: c.id,
      codigo: c.codigo,
      fecha: formatDateLocal(fecha),
      horaInicio: c.horaInicio,
      horaFin: c.horaFin,
      finca: c.finca?.nombre_finca || 'N/D',
      medico: this.nombreMedico(c.medico),
      subServicio: c.subServicio?.nombre || 'N/D',
      cantidadAnimales: c.cantidadAnimales,
      animales: (c.animales || []).map((a) => this.nombreAnimal(a)),
      estado: c.estado,
      dias_vencida: diasVencida,
    };
  }

  // ---------- Utils ----------
  private parseDate(value: Date | string): Date {
    if (value instanceof Date) return new Date(value);

    const [year, month, day] = value
      .toString()
      .split('T')[0]
      .split('-')
      .map(Number);

    return new Date(year, month - 1, day);
  }

  private nombreMedico(medico?: Medico): string {
    if (!medico) return 'N/D';
    return (
      medico.usuario.name ||
      `${medico.usuario.name || ''}`.trim() ||
      medico.usuario.email ||
      'N/D'
    );
  }

  private nombreAnimal(animal: any): string {
    if (!animal) return 'N/D';
    return (
      animal.identificador || animal.nombre_animal || animal.nombre || 'N/D'
    );
  }
}
