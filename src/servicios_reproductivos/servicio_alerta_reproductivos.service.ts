import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ServicioReproductivo } from './entities/servicios_reproductivo.entity';
import { MailService } from 'src/mail/mail.service';
import { EstadoServicio } from 'src/interfaces/servicios-reproductivos.enum';
import { PartoAnimal } from 'src/parto_animal/entities/parto_animal.entity';
import { ESPECIE_CONFIG } from 'src/interfaces/especies-config';
import { ServicioSinPartoDTO } from 'src/interfaces/alertas/servicio-sin-parto.dto';
import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { getPropietarioId } from 'src/utils/get-propietario-id';
import { formatDateLocal } from '../helpers/dateTimeLocal';

@Injectable()
export class ServiciosReproductivosAlertasService {
  private readonly logger = new Logger(
    ServiciosReproductivosAlertasService.name,
  );

  constructor(
    @InjectRepository(ServicioReproductivo)
    private servicioReproductivoRepository: Repository<ServicioReproductivo>,

    @InjectRepository(PartoAnimal)
    private partoAnimalRepository: Repository<PartoAnimal>,

    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,

    private mailService: MailService,
  ) {}

  /**
   * ALERTA: Servicios exitosos sin parto asociado
   * Se ejecuta todos los lunes a las 8:00 AM (hora Honduras)
   */
  @Cron('0 8 * * 1', {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarServiciosSinParto() {
    this.logger.log(
      'Iniciando verificación de servicios exitosos sin parto asociado...',
    );

    try {
      const servicios = await this.servicioReproductivoRepository
        .createQueryBuilder('servicio')
        .leftJoinAndSelect('servicio.hembra', 'hembra')
        .leftJoinAndSelect('hembra.especie', 'especie')
        .leftJoinAndSelect('servicio.macho', 'macho')
        .leftJoinAndSelect('servicio.creado_por', 'propietario')
        .where('servicio.exitoso = :exitoso', { exitoso: true })
        .andWhere('servicio.estado = :estado', {
          estado: EstadoServicio.REALIZADO,
        })
        .getMany();

      if (servicios.length === 0) {
        this.logger.log('No hay servicios exitosos registrados');
        return;
      }

      const partosExistentes = await this.partoAnimalRepository
        .createQueryBuilder('parto')
        .select('parto.servicio_id', 'servicio_id')
        .where('parto.servicio_id IS NOT NULL')
        .getRawMany();

      const serviciosConParto = new Set(
        partosExistentes.map((p) => p.servicio_id),
      );

      const hoy = new Date();
      const serviciosSinParto = servicios.filter((s) => {
        if (serviciosConParto.has(s.id)) return false;

        const fechaServicio = new Date(s.fecha_servicio);
        const diasTranscurridos = Math.floor(
          (hoy.getTime() - fechaServicio.getTime()) / (1000 * 60 * 60 * 24),
        );

        const especieNombre =
          s.hembra?.especie?.nombre || s.hembra?.especie || 'Bovino';

        const config = this.obtenerConfigEspecie(especieNombre as string);

        return diasTranscurridos > config.periodoGestacionMax + 15;
      });

      if (serviciosSinParto.length === 0) {
        this.logger.log('No hay servicios sin parto pendientes de alerta');
        return;
      }

      this.logger.log(
        `Se encontraron ${serviciosSinParto.length} servicios exitosos sin parto asociado`,
      );

      const serviciosPorPropietario =
        this.agruparServiciosPorPropietario(serviciosSinParto);

      for (const [propietarioId, serviciosCliente] of serviciosPorPropietario) {
        await this.enviarAlertaServiciosSinParto(serviciosCliente);
      }

      this.logger.log('Verificación de servicios sin parto completada');
    } catch (error) {
      this.logger.error(`Error en alerta de servicios sin parto`);
    }
  }

  private obtenerConfigEspecie(nombreEspecie: string) {
    const normalizado = nombreEspecie?.trim().toLowerCase() || 'bovino';

    const key = Object.keys(ESPECIE_CONFIG).find(
      (k) => k.toLowerCase() === normalizado,
    );

    return ESPECIE_CONFIG[key] || ESPECIE_CONFIG['Bovino'];
  }

  private agruparServiciosPorPropietario(
    servicios: ServicioReproductivo[],
  ): Map<string, ServicioReproductivo[]> {
    const mapa = new Map<string, ServicioReproductivo[]>();

    for (const servicio of servicios) {
      const key = servicio.creadoPorId;
      if (!key) continue;

      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key).push(servicio);
    }

    return mapa;
  }

  private async enviarAlertaServiciosSinParto(
    servicios: ServicioReproductivo[],
  ) {
    try {
      const creador = servicios[0].creado_por;
      const propietarioId = getPropietarioId(creador);

      const propietario = await this.clienteRepo.findOne({
        where: { id: propietarioId },
      });

      if (!propietario?.email) {
        this.logger.warn(`Propietario ${propietario?.id} no tiene email`);
        return;
      }

      const hoy = new Date();

      const serviciosFormateados: ServicioSinPartoDTO[] = servicios.map(
        (servicio) => {
          const fechaServicio = new Date(servicio.fecha_servicio);
          const diasTranscurridos = Math.floor(
            (hoy.getTime() - fechaServicio.getTime()) / (1000 * 60 * 60 * 24),
          );

          const especieNombre = this.obtenerNombreEspecie(
            servicio.hembra?.especie,
          );

          const config = this.obtenerConfigEspecie(especieNombre as string);
          const diasGestacion = config.periodoGestacionDias;
          const diasAtrasoParto = diasTranscurridos - diasGestacion;

          return {
            hembra:
              servicio.hembra?.identificador ||
              servicio.hembra?.nombre_animal ||
              'N/D',
            especie: especieNombre as string,
            tipo_servicio: servicio.tipo_servicio || 'N/D',
            fecha_servicio: formatDateLocal(fechaServicio),
            macho:
              servicio.macho?.identificador ||
              servicio.macho?.nombre_animal ||
              servicio.macho_externo_nombre ||
              'N/D',
            tecnico_responsable: servicio.tecnico_responsable || 'N/D',
            dias_transcurridos: diasTranscurridos,
            dias_gestacion_esperados: diasGestacion,
            dias_atraso_parto: diasAtrasoParto,
            observaciones: servicio.observaciones || null,
          };
        },
      );

      await this.mailService.sendServiciosSinParto(
        propietario.email,
        propietario.nombre || 'Cliente',
        servicios.length,
        serviciosFormateados,
      );

      this.logger.log(
        `Alerta de servicios sin parto enviada a ${propietario.email}`,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de servicios sin parto`);
    }
  }

  private obtenerNombreEspecie(especie: any): string {
    if (!especie) return 'Bovino';
    if (typeof especie === 'string') return especie;
    return especie.nombre || 'Bovino';
  }
}
