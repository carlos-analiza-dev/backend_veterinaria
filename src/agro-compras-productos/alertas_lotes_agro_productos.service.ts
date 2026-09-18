import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from 'src/mail/mail.service';
import {
  LoteStockDTO,
  ResumenStockSucursalDTO,
} from 'src/interfaces/alertas/lote-stock.dto';
import { LoteAgroProducto } from './entities/lote-agro-compra.entity';
import { AgroProducto } from 'src/agro-productos/entities/agro-producto.entity';

const STOCK_BAJO = 5;
const STOCK_LIMITADO = 10;

@Injectable()
export class AlertasLotesAgroProductos {
  private readonly logger = new Logger(AlertasLotesAgroProductos.name);

  constructor(
    @InjectRepository(LoteAgroProducto)
    private loteRepo: Repository<LoteAgroProducto>,

    private mailService: MailService,
  ) {}

  /**
   * ALERTA: Lotes con stock bajo (<=5) o limitado (<=10)
   * Se ejecuta todos los días a las 6:00 AM (hora Honduras)
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarStockBajo() {
    this.logger.log('Iniciando verificación de stock de lotes...');

    try {
      const lotes = await this.loteRepo
        .createQueryBuilder('lote')
        .leftJoinAndSelect('lote.producto', 'producto')
        .leftJoinAndSelect('lote.sucursal', 'sucursal')
        .leftJoinAndSelect('sucursal.gerente', 'gerente')
        .leftJoinAndSelect('sucursal.agroservicio', 'agroservicio')
        .leftJoinAndSelect('agroservicio.pais', 'pais')
        .where('lote.cantidad > 0')
        .andWhere('lote.cantidad <= :limite', { limite: STOCK_LIMITADO })
        .andWhere('sucursal.isActive = :activo', { activo: true })
        .orderBy('lote.cantidad', 'ASC')
        .getMany();

      if (lotes.length === 0) {
        return;
      }

      const porSucursal = this.agruparPorSucursal(lotes);

      for (const [, lotesSucursal] of porSucursal) {
        await this.enviarAlertaStockSucursal(lotesSucursal);
      }

      this.logger.log('Verificación de stock completada');
    } catch (error) {
      this.logger.error(`Error en alerta de stock`);
    }
  }

  // ==================================================================
  // Helpers
  // ==================================================================
  private agruparPorSucursal(
    lotes: LoteAgroProducto[],
  ): Map<string, LoteAgroProducto[]> {
    const mapa = new Map<string, LoteAgroProducto[]>();

    for (const lote of lotes) {
      const key = lote.sucursal?.id || lote.id_sucursal || 'SIN_SUCURSAL';
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(lote);
    }

    return mapa;
  }

  private async enviarAlertaStockSucursal(lotes: LoteAgroProducto[]) {
    try {
      const sucursal = lotes[0].sucursal;
      const email = sucursal?.gerente?.email;

      if (!email) {
        return;
      }

      const resumen = this.formatearResumen(lotes);

      await this.mailService.sendAlertaStockLotes(
        email,
        sucursal?.gerente?.nombre || 'Gerente',
        resumen,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de stock`);
    }
  }

  private formatearResumen(lotes: LoteAgroProducto[]): ResumenStockSucursalDTO {
    const sucursal = lotes[0].sucursal;

    const moneda = sucursal?.agroservicio?.pais?.simbolo_moneda ?? '$';

    const formateados: LoteStockDTO[] = lotes.map((l) => {
      const cantidad = Number(l.cantidad);
      const costoPorUnidad = l.costo_por_unidad
        ? Number(l.costo_por_unidad)
        : null;
      const costoTotal = Number(l.costo) || 0;

      return {
        id: l.id,
        producto: this.nombreProducto(l.producto),
        sucursal: sucursal?.nombre || 'N/D',
        cantidad,
        costo_por_unidad: costoPorUnidad,
        valor_total: costoTotal,
        es_bajo: cantidad <= STOCK_BAJO,
        es_limitado: cantidad > STOCK_BAJO && cantidad <= STOCK_LIMITADO,
      };
    });

    return {
      sucursal: sucursal?.nombre || 'N/D',
      moneda,
      total_lotes: formateados.length,
      total_bajos: formateados.filter((l) => l.es_bajo).length,
      total_limitados: formateados.filter((l) => l.es_limitado).length,
      lotes: formateados,
    };
  }

  private nombreProducto(producto?: AgroProducto): string {
    if (!producto) return 'N/D';
    return producto.nombre || producto.codigo || producto.codigo_barra || 'N/D';
  }
}
