import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketplaceAnimale } from './entities/marketplace_animale.entity';
import { MailService } from 'src/mail/mail.service';
import {
  PublicacionAlertaDTO,
  ResumenPublicacionesVendedorDTO,
} from 'src/interfaces/alertas/publicacion-alerta.dto';
import { formatearFechaConTiempo } from 'src/helpers/format-date';

const DIAS_SIN_INTERACCION = 30;
const VIEWS_ALTAS = 50;

@Injectable()
export class AlertasPublicacionesService {
  private readonly logger = new Logger(AlertasPublicacionesService.name);

  constructor(
    @InjectRepository(MarketplaceAnimale)
    private publicacionRepo: Repository<MarketplaceAnimale>,

    private mailService: MailService,
  ) {}

  /**
   * Publicaciones con problemas
   * Se ejecuta todos los días a las 10:00 AM (hora Honduras)
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarPublicaciones() {
    this.logger.log('Iniciando verificación de publicaciones...');

    try {
      const publicaciones = await this.publicacionRepo
        .createQueryBuilder('pub')
        .leftJoinAndSelect('pub.animal', 'animal')
        .leftJoinAndSelect('pub.vendedor', 'vendedor')
        .leftJoinAndSelect('pub.categoria', 'categoria')
        .leftJoinAndSelect('pub.subcategoria', 'subcategoria')
        .where('pub.disponible = :disponible', { disponible: true })
        .andWhere('pub.eliminada = :eliminada', { eliminada: false })
        .getMany();

      if (publicaciones.length === 0) {
        return;
      }

      const porVendedor = this.agruparPorVendedor(publicaciones);

      for (const [, publicacionesVendedor] of porVendedor) {
        await this.enviarAlertaVendedor(publicacionesVendedor);
      }

      this.logger.log('Verificación de publicaciones completada');
    } catch (error) {
      this.logger.error(`Error en alerta de publicaciones`);
    }
  }

  private agruparPorVendedor(
    publicaciones: MarketplaceAnimale[],
  ): Map<string, MarketplaceAnimale[]> {
    const mapa = new Map<string, MarketplaceAnimale[]>();

    for (const pub of publicaciones) {
      const key = pub.vendedor?.id || 'SIN_VENDEDOR';
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(pub);
    }

    return mapa;
  }

  private async enviarAlertaVendedor(publicaciones: MarketplaceAnimale[]) {
    try {
      const vendedor = publicaciones[0].vendedor;

      if (!vendedor?.email) {
        return;
      }

      const resumen = this.clasificarPublicaciones(publicaciones);

      const totalAlertas =
        resumen.sin_interaccion.length +
        resumen.muchas_views_sin_vender.length +
        resumen.vendidas_activas.length;

      if (totalAlertas === 0) {
        return;
      }

      await this.mailService.sendAlertasPublicaciones(
        vendedor.email,
        vendedor.nombre || 'Vendedor',
        resumen,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta a vendedor`);
    }
  }

  private clasificarPublicaciones(
    publicaciones: MarketplaceAnimale[],
  ): ResumenPublicacionesVendedorDTO {
    const vendedor = publicaciones[0].vendedor;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const sin_interaccion: PublicacionAlertaDTO[] = [];
    const muchas_views_sin_vender: PublicacionAlertaDTO[] = [];
    const vendidas_activas: PublicacionAlertaDTO[] = [];

    for (const pub of publicaciones) {
      const dto = this.formatearPublicacion(pub, hoy);

      // 1. Sin interacción (30+ días, 0 views)
      if (dto.dias_publicada >= DIAS_SIN_INTERACCION && dto.views === 0) {
        sin_interaccion.push(dto);
      }

      // 2. Muchas views sin venderse (50+ views, 30+ días)
      if (
        dto.views >= VIEWS_ALTAS &&
        dto.dias_publicada >= DIAS_SIN_INTERACCION &&
        !pub.vendido
      ) {
        muchas_views_sin_vender.push(dto);
      }
    }

    return {
      vendedor: vendedor?.nombre || 'N/D',
      email: vendedor?.email || 'N/D',
      total_publicaciones: publicaciones.length,
      sin_interaccion,
      muchas_views_sin_vender,
      vendidas_activas,
    };
  }

  private formatearPublicacion(
    pub: MarketplaceAnimale,
    hoy: Date,
  ): PublicacionAlertaDTO {
    const createdAt = new Date(pub.created_at);
    createdAt.setHours(0, 0, 0, 0);

    const diasPublicada = Math.floor(
      (hoy.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      id: pub.id,
      nombre: pub.nombre,
      animal: pub.animal?.identificador || pub.animal?.nombre_animal || null,
      precio: Number(pub.precio) || 0,
      moneda: pub.moneda || '$',
      categoria: pub.categoria?.nombre || 'N/D',
      subcategoria: pub.subcategoria?.nombre || 'N/D',
      views: pub.views || 0,
      dias_publicada: diasPublicada,
      fecha_publicacion: formatearFechaConTiempo(createdAt),
    };
  }
}
