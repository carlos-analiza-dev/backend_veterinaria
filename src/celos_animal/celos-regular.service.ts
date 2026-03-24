import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CelosAnimalValidationService } from './celos-animal-validation.service';

@Injectable()
export class CelosRegularService {
  private readonly logger = new Logger(CelosRegularService.name);

  constructor(private validationService: CelosAnimalValidationService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCeloStatusUpdate() {
    this.logger.log('Ejecutando actualización automática de estados de celos');
    try {
      const resultado =
        await this.validationService.actualizarEstadosCelosVencidos();
      this.logger.log(`Celos actualizados: ${resultado.actualizados}`);

      if (resultado.actualizados > 0) {
        this.logger.debug(`Detalles: ${JSON.stringify(resultado.detalles)}`);
      }
    } catch (error) {
      this.logger.error(
        `Error actualizando estados de celos: ${error.message}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async handleCelosSinFechaFin() {
    this.logger.log('Ejecutando verificación de celos activos sin fecha fin');
    try {
      await this.validationService.programarActualizacionAutomatica();
    } catch (error) {
      this.logger.error(
        `Error actualizando celos sin fecha fin: ${error.message}`,
      );
    }
  }
}
