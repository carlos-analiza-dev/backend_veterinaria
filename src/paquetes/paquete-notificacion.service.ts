import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron } from '@nestjs/schedule';
import { ClientePaquete } from 'src/cliente_paquetes/entities/cliente_paquete.entity';

@Injectable()
export class PaqueteNotificacionService {
  private readonly logger = new Logger(PaqueteNotificacionService.name);

  constructor(
    @InjectRepository(ClientePaquete)
    private clientePaqueteRepository: Repository<ClientePaquete>,
    private mailerService: MailerService,
  ) {}

  @Cron('0 8 * * *')
  async notificarPaquetesPorVencer() {
    this.logger.log('Iniciando verificación de paquetes por vencer...');

    try {
      const hoy = new Date();
      const diasNotificacion = [7, 3, 1];

      for (const dias of diasNotificacion) {
        const fechaNotificacion = new Date(hoy);
        fechaNotificacion.setDate(fechaNotificacion.getDate() + dias);
        await this.enviarNotificacionesParaDia(fechaNotificacion, dias);
      }

      this.logger.log('Verificación de paquetes por vencer completada');
    } catch (error) {
      this.logger.error(`Error en notificación de paquetes`);
    }
  }

  private async enviarNotificacionesParaDia(
    fechaVencimiento: Date,
    diasRestantes: number,
  ) {
    const fechaInicio = new Date(fechaVencimiento);
    fechaInicio.setHours(0, 0, 0, 0);

    const fechaFin = new Date(fechaVencimiento);
    fechaFin.setHours(23, 59, 59, 999);

    const paquetesPorVencer = await this.clientePaqueteRepository
      .createQueryBuilder('clientePaquete')
      .leftJoinAndSelect('clientePaquete.cliente', 'cliente')
      .leftJoinAndSelect('cliente.pais', 'pais')
      .leftJoinAndSelect('clientePaquete.paquete', 'paquete')
      .leftJoinAndSelect('paquete.preciosPorPais', 'preciosPorPais')
      .leftJoinAndSelect('preciosPorPais.pais', 'paisPrecio')
      .where('clientePaquete.activo = :activo', { activo: true })
      .andWhere('clientePaquete.fechaFin BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin,
      })
      .andWhere('cliente.isActive = :isActive', { isActive: true })
      .andWhere('cliente.email IS NOT NULL')
      .getMany();

    if (paquetesPorVencer.length === 0) {
      this.logger.log(`No hay paquetes que venzan en ${diasRestantes} día(s)`);
      return;
    }

    this.logger.log(
      `Se encontraron ${paquetesPorVencer.length} paquetes que vencen en ${diasRestantes} día(s)`,
    );

    for (const clientePaquete of paquetesPorVencer) {
      await this.enviarNotificacionCliente(clientePaquete, diasRestantes);
    }
  }

  private async enviarNotificacionCliente(
    clientePaquete: ClientePaquete,
    diasRestantes: number,
  ) {
    try {
      const { cliente, paquete, fechaFin } = clientePaquete;

      if (!cliente.email) {
        this.logger.warn(`Cliente ${cliente.id} no tiene email`);
        return;
      }

      const simboloMoneda = cliente.pais?.simbolo_moneda || 'L';

      const fechaFormateada = fechaFin.toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const es_urgente = diasRestantes <= 1;
      const es_aviso_importante = diasRestantes <= 3;

      await this.mailerService.sendMail({
        to: cliente.email,
        subject: `⚠️ Tu paquete ${paquete.nombre} está por vencer - El Sembrador`,
        template: './paquete-por-vencer',
        context: {
          nombre_cliente: cliente.nombre,
          nombre_paquete: paquete.nombre,
          dias_restantes: diasRestantes,
          fecha_vencimiento: fechaFormateada,
          simbolo_moneda: simboloMoneda,
          max_fincas: paquete.maxFincas,
          max_animales: paquete.maxAnimales,
          max_trabajadores: paquete.maxTrabajadores,
          ecommerce: paquete.ecommerce ? 'Sí' : 'No',
          es_urgente,
          es_aviso_importante,
          app_url:
            process.env.FRONTEND_URL_CLIENT || 'https://app.elsembrador.com',
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(
        `Notificación enviada a ${cliente.email} - Paquete ${paquete.nombre} vence en ${diasRestantes} días`,
      );
    } catch (error) {
      this.logger.error(`Error enviando notificación`);
    }
  }
}
