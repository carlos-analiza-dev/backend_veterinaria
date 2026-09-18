import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InvLoteAgroInsumo } from './entities/inv-lote-agro-insumo.entity';
import { AgroInsumos } from 'src/insumos/entities/agro_insumos.entity';
import { MailService } from 'src/mail/mail.service';
import {
  InsumoStockDTO,
  ResumenStockInsumoSucursalDTO,
} from 'src/interfaces/alertas/insumo-stock.dto';

const STOCK_BAJO = 5;
const STOCK_LIMITADO = 10;

@Injectable()
export class AlertasInsumosService {
  private readonly logger = new Logger(AlertasInsumosService.name);

  constructor(
    @InjectRepository(InvLoteAgroInsumo)
    private loteInsumoRepo: Repository<InvLoteAgroInsumo>,

    private mailService: MailService,
  ) {}

  /**
   * ALERTA: Lotes de insumos con stock bajo (<=5) o limitado (<=10)
   * Se ejecuta todos los días a las 7:00 AM (hora Honduras)
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarStockBajoInsumos() {
    this.logger.log('Iniciando verificación de stock de insumos...');

    try {
      const lotes = await this.loteInsumoRepo
        .createQueryBuilder('lote')
        .leftJoinAndSelect('lote.insumo', 'insumo')
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

      this.logger.log('Verificación de stock de insumos completada');
    } catch (error) {
      this.logger.error(`Error en alerta de stock de insumos`);
    }
  }

  // ==================================================================
  // Helpers
  // ==================================================================
  private agruparPorSucursal(
    lotes: InvLoteAgroInsumo[],
  ): Map<string, InvLoteAgroInsumo[]> {
    const mapa = new Map<string, InvLoteAgroInsumo[]>();

    for (const lote of lotes) {
      const key = lote.sucursal?.id || 'SIN_SUCURSAL';
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(lote);
    }

    return mapa;
  }

  private async enviarAlertaStockSucursal(lotes: InvLoteAgroInsumo[]) {
    try {
      const sucursal = lotes[0].sucursal;
      const email = sucursal?.gerente?.email;

      if (!email) {
        return;
      }

      const resumen = this.formatearResumen(lotes);

      await this.mailService.sendAlertaStockInsumos(
        email,
        sucursal?.gerente?.nombre || 'Gerente',
        resumen,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de stock de insumos`);
    }
  }

  private formatearResumen(
    lotes: InvLoteAgroInsumo[],
  ): ResumenStockInsumoSucursalDTO {
    const sucursal = lotes[0].sucursal;

    const moneda = sucursal?.agroservicio?.pais?.simbolo_moneda ?? '$';

    const formateados: InsumoStockDTO[] = lotes.map((l) => {
      const cantidad = Number(l.cantidad);
      const costoPorUnidad = l.costo_por_unidad
        ? Number(l.costo_por_unidad)
        : null;
      const costoTotal = Number(l.costo) || 0;

      return {
        id: l.id,
        insumo: this.nombreInsumo(l.insumo),
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

  private nombreInsumo(insumo?: AgroInsumos): string {
    if (!insumo) return 'N/D';
    return insumo.nombre || insumo.codigo || 'N/D';
  }
}
