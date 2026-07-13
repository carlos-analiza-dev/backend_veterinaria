import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { NotificacionesAdmin } from './entities/notificaciones_admin.entity';

@Injectable()
export class NotificacionesCronServicio {
  private readonly logger = new Logger(NotificacionesCronServicio.name);

  constructor(
    @InjectRepository(NotificacionesAdmin)
    private readonly notificacionesRepo: Repository<NotificacionesAdmin>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async eliminarNotificacionesAntiguas() {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 5);

    const result = await this.notificacionesRepo.delete({
      createdAt: LessThanOrEqual(fechaLimite),
    });

    this.logger.log(
      `Se eliminaron ${result.affected ?? 0} notificaciones antiguas.`,
    );
  }
}
