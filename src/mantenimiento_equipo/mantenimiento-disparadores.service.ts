import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { MantenimientoEquipo } from './entities/mantenimiento_equipo.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class MantenimientoDisparadoresService {
  private readonly logger = new Logger(MantenimientoDisparadoresService.name);

  constructor(
    @InjectRepository(MantenimientoEquipo)
    private readonly mantenimientoRepo: Repository<MantenimientoEquipo>,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async notificarMantenimientoPorFinalizar() {
    this.logger.log('Verificando mantenimientos por finalizar...');

    const ahora = new Date();
    const en2Horas = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);

    try {
      const mantenimientos = await this.mantenimientoRepo.find({
        where: {
          fecha_final: Between(ahora, en2Horas),
          notificadoFinalizacion: false,
        },
        relations: ['equipo', 'equipo.finca', 'equipo.finca.propietario'],
      });

      for (const mantenimiento of mantenimientos) {
        try {
          const equipo = mantenimiento.equipo;

          if (!equipo?.finca?.propietario) {
            this.logger.warn(
              `Mantenimiento ${mantenimiento.id} sin propietario`,
            );
            continue;
          }

          const propietario = equipo.finca.propietario;

          const fechaFormateada = new Date(
            mantenimiento.fecha_final,
          ).toLocaleString('es-HN', {
            timeZone: 'America/Tegucigalpa',
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          await this.mailService.sendMantenimientoPorFinalizar(
            propietario.email,
            propietario.nombre,
            equipo.nombre,
            fechaFormateada,
          );

          mantenimiento.notificadoFinalizacion = true;
          await this.mantenimientoRepo.save(mantenimiento);

          this.logger.log(
            `Notificación enviada (por finalizar): ${equipo.nombre}`,
          );
        } catch (error) {
          this.logger.error(
            `Error notificando mantenimiento ${mantenimiento.id}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error en cron mantenimiento finalización');
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async notificarProximoMantenimiento() {
    this.logger.log('Verificando próximos mantenimientos...');

    const ahora = new Date();
    const en3Dias = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);

    try {
      const mantenimientos = await this.mantenimientoRepo.find({
        where: {
          proximoMantenimiento: Between(ahora, en3Dias),
          notificado_mantenimiento_proximo: false,
        },
        relations: ['equipo', 'equipo.finca', 'equipo.finca.propietario'],
      });

      for (const mantenimiento of mantenimientos) {
        try {
          const equipo = mantenimiento.equipo;

          if (!equipo?.finca?.propietario) {
            this.logger.warn(
              `Mantenimiento ${mantenimiento.id} sin propietario`,
            );
            continue;
          }

          const propietario = equipo.finca.propietario;

          const fechaFormateada = new Date(
            mantenimiento.fecha_final,
          ).toLocaleString('es-HN', {
            timeZone: 'America/Tegucigalpa',
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          await this.mailService.sendMantenimientoProximo(
            propietario.email,
            propietario.nombre,
            equipo.nombre,
            equipo.codigoInterno || 'N/A',
            equipo.finca.nombre_finca,
            fechaFormateada,
          );

          mantenimiento.notificado_mantenimiento_proximo = true;
          await this.mantenimientoRepo.save(mantenimiento);

          this.logger.log(`Notificación enviada: ${equipo.nombre}`);
        } catch (error) {
          this.logger.error(
            `Error notificando mantenimiento ${mantenimiento.id}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error en cron de mantenimiento');
    }
  }
}
