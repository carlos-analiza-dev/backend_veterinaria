import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AgroFacturacion } from './entities/agro_facturacion.entity';
import { MailService } from 'src/mail/mail.service';
import {
  FacturaPendienteDTO,
  ResumenFacturasPendientesSucursalDTO,
} from 'src/interfaces/alertas/factura-pendiente.dto';
import { EstadoFactura } from 'src/factura_encabezado/entities/factura_encabezado.entity';
import { formatearFechaConTiempo } from 'src/helpers/format-date';
import { AgroCliente } from 'src/agro_clientes/entities/agro_cliente.entity';

const DIAS_URGENTE = 3;

@Injectable()
export class AlertasFacturasService {
  private readonly logger = new Logger(AlertasFacturasService.name);

  constructor(
    @InjectRepository(AgroFacturacion)
    private facturaRepo: Repository<AgroFacturacion>,

    private mailService: MailService,
  ) {}

  /**
   * ALERTA: Facturas emitidas sin procesar
   * Se ejecuta todos los días a las 6:00 AM (hora Honduras)
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarFacturasEmitidas() {
    this.logger.log('Iniciando verificación de facturas emitidas...');

    try {
      const facturas = await this.facturaRepo
        .createQueryBuilder('factura')
        .leftJoinAndSelect('factura.cliente', 'cliente')
        .leftJoinAndSelect('factura.sucursal', 'sucursal')
        .leftJoinAndSelect('sucursal.gerente', 'gerente')
        .leftJoinAndSelect('sucursal.agroservicio', 'agroservicio')
        .leftJoinAndSelect('agroservicio.pais', 'pais')
        .where('factura.estado = :estado', {
          estado: EstadoFactura.EMITIDA,
        })
        .andWhere('sucursal.isActive = :activo', { activo: true })
        .orderBy('factura.fecha_recepcion', 'ASC')
        .getMany();

      if (facturas.length === 0) {
        return;
      }

      const porSucursal = this.agruparPorSucursal(facturas);

      for (const [, facturasSucursal] of porSucursal) {
        await this.enviarAlertaPorSucursal(facturasSucursal);
      }

      this.logger.log('Verificación de facturas emitidas completada');
    } catch (error) {
      this.logger.error(`Error en alerta de facturas`);
    }
  }

  // ==================================================================
  // Helpers
  // ==================================================================
  private agruparPorSucursal(
    facturas: AgroFacturacion[],
  ): Map<string, AgroFacturacion[]> {
    const mapa = new Map<string, AgroFacturacion[]>();

    for (const factura of facturas) {
      const key = factura.sucursal_id || 'SIN_SUCURSAL';
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(factura);
    }

    return mapa;
  }

  private async enviarAlertaPorSucursal(facturas: AgroFacturacion[]) {
    try {
      const sucursal = facturas[0].sucursal;
      const email = sucursal?.gerente?.email;

      if (!email) {
        return;
      }

      const resumen = this.formatearResumen(facturas);

      if (resumen.total_facturas === 0) {
        return;
      }

      await this.mailService.sendAlertaFacturasEmitidas(
        email,
        sucursal?.gerente?.nombre || 'Gerente',
        resumen,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de facturas`);
    }
  }

  private formatearResumen(
    facturas: AgroFacturacion[],
  ): ResumenFacturasPendientesSucursalDTO {
    const sucursal = facturas[0].sucursal;
    const moneda = sucursal?.agroservicio?.pais?.simbolo_moneda ?? '$';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const formateadas: FacturaPendienteDTO[] = facturas.map((f) => {
      const createdAt = new Date(f.created_at);
      createdAt.setHours(0, 0, 0, 0);

      const diasTranscurridos = Math.floor(
        (hoy.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: f.id,
        numero_factura: f.numero_factura,
        cliente: this.nombreCliente(f.cliente),
        fecha_generacion: formatearFechaConTiempo(f.created_at),
        total: Number(f.total) || 0,
        forma_pago: f.forma_pago,
        dias_transcurridos: diasTranscurridos,
        es_urgente: diasTranscurridos >= DIAS_URGENTE,
      };
    });

    return {
      sucursal: sucursal?.nombre || 'N/D',
      moneda,
      total_facturas: formateadas.length,
      monto_total: formateadas.reduce((sum, f) => sum + f.total, 0),
      facturas: formateadas,
    };
  }

  private nombreCliente(cliente?: AgroCliente): string {
    if (!cliente) return 'N/D';
    return cliente.nombre || 'N/D';
  }
}
