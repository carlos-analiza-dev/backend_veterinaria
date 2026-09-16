import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SanidadAnimal } from './entities/sanidad_animal.entity';
import { MailService } from 'src/mail/mail.service';
import { formatDateLocal } from 'src/helpers/dateTimeLocal';

@Injectable()
export class SanidadAlertasService {
  private readonly logger = new Logger(SanidadAlertasService.name);

  constructor(
    @InjectRepository(SanidadAnimal)
    private sanidadAnimalRepository: Repository<SanidadAnimal>,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async alertarEventosProximos() {
    this.logger.log('Iniciando verificación de eventos sanitarios próximos...');

    try {
      const hoy = new Date();
      const diasAlerta = [7, 3, 1];

      for (const dias of diasAlerta) {
        const fechaAlerta = new Date(hoy);
        fechaAlerta.setDate(fechaAlerta.getDate() + dias);
        await this.procesarEventosProximos(fechaAlerta, dias);
      }

      this.logger.log('Verificación de eventos próximos completada');
    } catch (error) {
      this.logger.error(`Error en alerta de eventos próximos`);
    }
  }

  private async procesarEventosProximos(
    fechaEvento: Date,
    diasRestantes: number,
  ) {
    const fecha = fechaEvento.toISOString().split('T')[0];

    const eventos = await this.sanidadAnimalRepository
      .createQueryBuilder('sanidad')
      .leftJoinAndSelect('sanidad.animal', 'animal')
      .leftJoinAndSelect('sanidad.propietario', 'propietario')
      .where('sanidad.eliminado = :eliminado', {
        eliminado: false,
      })
      .andWhere('sanidad.proxima_fecha_evento = :fecha', {
        fecha,
      })
      .getMany();

    if (eventos.length === 0) {
      this.logger.log(`No hay eventos programados en ${diasRestantes} día(s)`);
      return;
    }

    this.logger.log(
      `Se encontraron ${eventos.length} eventos programados en ${diasRestantes} día(s)`,
    );

    const eventosPorPropietario = this.agruparEventosPorPropietario(eventos);

    for (const [propietarioId, eventosCliente] of eventosPorPropietario) {
      await this.enviarAlertaEventosProximos(eventosCliente, diasRestantes);
    }
  }

  private agruparEventosPorPropietario(
    eventos: SanidadAnimal[],
  ): Map<string, SanidadAnimal[]> {
    const mapa = new Map<string, SanidadAnimal[]>();

    for (const evento of eventos) {
      const key = evento.propietarioId;
      if (!mapa.has(key)) {
        mapa.set(key, []);
      }
      mapa.get(key).push(evento);
    }

    return mapa;
  }

  private async enviarAlertaEventosProximos(
    eventos: SanidadAnimal[],
    diasRestantes: number,
  ) {
    try {
      const propietario = eventos[0].propietario;

      if (!propietario?.email) {
        this.logger.warn(`Propietario ${propietario?.id} no tiene email`);
        return;
      }

      const es_urgente = diasRestantes <= 1;
      const es_aviso_importante = diasRestantes <= 3;

      const eventosPorTipo = this.organizarEventosPorTipo(eventos);

      await this.mailService.sendEventosSanitariosProximos(
        propietario.email,
        propietario.nombre || 'Cliente',
        eventos.length,
        diasRestantes,
        eventosPorTipo,
        es_urgente,
        es_aviso_importante,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de eventos próximos`);
    }
  }

  private organizarEventosPorTipo(eventos: SanidadAnimal[]) {
    const tipos: Record<
      string,
      {
        animal: string;
        fecha: Date;
        responsable: string;
        tratamiento: string;
        observaciones: string;
        vacuna_aplicada: string;
        tipo_desparasitacion: string;
        dosis: number;
        peso_usado: number;
      }[]
    > = {};

    for (const evento of eventos) {
      const tipo = evento.tipo_servicio || 'Otro';

      if (!tipos[tipo]) {
        tipos[tipo] = [];
      }

      tipos[tipo].push({
        animal:
          evento.animal?.identificador || evento.animal?.nombre_animal || 'N/D',

        fecha: evento.proxima_fecha_evento,

        responsable: evento.responsable || 'N/D',

        tratamiento: evento.tratamiento_aplicado || 'N/D',

        observaciones: evento.observaciones || 'N/D',

        vacuna_aplicada: evento.vacuna_aplicada || 'N/D',

        tipo_desparasitacion: evento.tipo_desparasitacion || 'N/D',

        dosis: evento.dosis || 0,

        peso_usado: evento.peso_usado || 0,
      });
    }

    return Object.entries(tipos).map(([tipo, eventos]) => ({
      tipo,
      eventos,
    }));
  }

  /**
   * ALERTA 2: Eventos Sin Seguimiento
   * Se ejecuta semanalmente los lunes a las 8:00 AM
   */
  @Cron('0 8 * * 1', {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarEventosSinSeguimiento() {
    this.logger.log('Iniciando verificación de eventos sin seguimiento...');

    try {
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);

      const eventos = await this.sanidadAnimalRepository
        .createQueryBuilder('sanidad')
        .leftJoinAndSelect('sanidad.animal', 'animal')
        .leftJoinAndSelect('sanidad.propietario', 'propietario')
        .where('sanidad.eliminado = :eliminado', { eliminado: false })
        .andWhere('sanidad.proxima_fecha_evento IS NULL')
        .andWhere('sanidad.fecha_evento < :haceUnMes', { haceUnMes })
        .getMany();

      if (eventos.length === 0) {
        this.logger.log('No hay eventos sin seguimiento');
        return;
      }

      const eventosPorPropietario = this.agruparEventosPorPropietario(eventos);

      for (const [propietarioId, eventosCliente] of eventosPorPropietario) {
        await this.enviarAlertaEventosSinSeguimiento(eventosCliente);
      }

      this.logger.log('Verificación de eventos sin seguimiento completada');
    } catch (error) {
      this.logger.error(`Error en alerta de eventos sin seguimiento`);
    }
  }

  private async enviarAlertaEventosSinSeguimiento(eventos: SanidadAnimal[]) {
    try {
      const propietario = eventos[0].propietario;

      if (!propietario?.email) {
        this.logger.warn(`Propietario ${propietario?.id} no tiene email`);
        return;
      }

      const eventosSinSeguimiento = eventos.map((evento) => {
        const fechaEvento = evento.fecha_evento
          ? new Date(evento.fecha_evento)
          : new Date();
        const hoy = new Date();
        const diffTime = Math.abs(hoy.getTime() - fechaEvento.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          animal:
            evento.animal?.identificador ||
            evento.animal?.nombre_animal ||
            'N/D',
          tipo_servicio: evento.tipo_servicio || 'N/D',
          fecha_evento: evento.fecha_evento
            ? formatDateLocal(evento.fecha_evento)
            : 'N/D',
          responsable: evento.responsable || 'N/D',
          observaciones: evento.observaciones || 'N/D',
          dias_sin_seguimiento: diffDays,
        };
      });

      await this.mailService.sendEventosSinSeguimiento(
        propietario.email,
        propietario.nombre || 'Cliente',
        eventos.length,
        eventosSinSeguimiento,
      );

      this.logger.log(
        `Alerta de eventos sin seguimiento enviada a ${propietario.email}`,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de sin seguimiento`);
    }
  }
}
