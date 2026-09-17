// src/pedidos/alertas-pedidos.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { MailService } from 'src/mail/mail.service';
import { formatDateLocal } from '../helpers/dateTimeLocal';
import {
  PedidoEstancadoDTO,
  ResumenPedidosPendientesDTO,
} from 'src/interfaces/alertas/pedido-alerta.dto';

const HORAS_ESTANCADO = 24;

const HORAS_CRITICO = 48;

@Injectable()
export class AlertasPedidosService {
  private readonly logger = new Logger(AlertasPedidosService.name);

  constructor(
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,

    private mailService: MailService,
  ) {}

  //RESUMEN PEDIDOS PENDIENTES ESTANCADOS
  @Cron(CronExpression.EVERY_DAY_AT_7AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async alertarPedidosEstancados() {
    this.logger.log('Iniciando verificación de pedidos estancados...');

    try {
      const limite = new Date();
      limite.setHours(limite.getHours() - HORAS_ESTANCADO);

      const pedidos = await this.pedidoRepo
        .createQueryBuilder('pedido')
        .leftJoinAndSelect('pedido.cliente', 'cliente')
        .leftJoinAndSelect('pedido.sucursal', 'sucursal')
        .leftJoinAndSelect('sucursal.gerente', 'gerente')
        .where('pedido.estado = :estado', { estado: EstadoPedido.PENDIENTE })
        .andWhere('pedido.created_at < :limite', { limite })
        .orderBy('pedido.created_at', 'ASC')
        .getMany();

      if (pedidos.length === 0) {
        return;
      }

      const porSucursal = this.agruparPorSucursal(pedidos);

      for (const [, pedidosSucursal] of porSucursal) {
        await this.enviarAlertaPedidosEstancados(pedidosSucursal);
      }

      this.logger.log('Verificación de pedidos estancados completada');
    } catch (error) {
      this.logger.error(`Error en alerta de pedidos estancados`);
    }
  }

  // Resumen diario de pedidos pendientes
  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'America/Tegucigalpa',
  })
  async enviarResumenPedidosPendientes() {
    this.logger.log('Iniciando resumen diario de pedidos pendientes...');

    try {
      const pedidos = await this.pedidoRepo
        .createQueryBuilder('pedido')
        .leftJoinAndSelect('pedido.cliente', 'cliente')
        .leftJoinAndSelect('pedido.sucursal', 'sucursal')
        .leftJoinAndSelect('sucursal.gerente', 'gerente')
        .where('pedido.estado = :estado', { estado: EstadoPedido.PENDIENTE })
        .orderBy('pedido.created_at', 'ASC')
        .getMany();

      if (pedidos.length === 0) {
        return;
      }

      const porSucursal = this.agruparPorSucursal(pedidos);

      for (const [, pedidosSucursal] of porSucursal) {
        await this.enviarResumenPorSucursal(pedidosSucursal);
      }

      this.logger.log('Resumen diario por sucursal enviado');
    } catch (error) {
      this.logger.error(`Error en resumen diario de pedidos`);
    }
  }

  // Helpers
  private agruparPorSucursal(pedidos: Pedido[]): Map<string, Pedido[]> {
    const mapa = new Map<string, Pedido[]>();

    for (const pedido of pedidos) {
      const key =
        pedido.sucursal?.id || pedido.id_sucursal_cercana || 'SIN_SUCURSAL';

      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(pedido);
    }

    return mapa;
  }

  private async enviarAlertaPedidosEstancados(pedidos: Pedido[]) {
    try {
      const sucursal = pedidos[0].sucursal;
      const email = sucursal?.gerente.email;

      if (!email) {
        return;
      }

      const formateados: PedidoEstancadoDTO[] = pedidos.map((p) =>
        this.formatearPedidoEstancado(p),
      );

      await this.mailService.sendPedidosEstancados(
        email,
        sucursal?.nombre || sucursal?.nombre || 'Sucursal',
        formateados.length,
        formateados,
      );
    } catch (error) {
      this.logger.error(`Error enviando alerta de pedidos estancados`);
    }
  }

  private async enviarResumenPorSucursal(pedidos: Pedido[]) {
    try {
      const sucursal = pedidos[0].sucursal;
      const email = sucursal?.gerente?.email;

      if (!email) {
        return;
      }

      const formateadas: ResumenPedidosPendientesDTO[] = [
        this.formatearResumenSucursal(pedidos),
      ];

      await this.mailService.sendResumenPedidosPendientes(
        email,
        sucursal.gerente.name || 'Gerente',
        sucursal?.nombre || 'Sucursal',
        formateadas,
      );

      this.logger.log(
        `Resumen diario enviado a gerente ${email} (${pedidos.length} pedidos)`,
      );
    } catch (error) {
      this.logger.error(`Error enviando resumen a sucursal`);
    }
  }

  private formatearResumenSucursal(
    pedidos: Pedido[],
  ): ResumenPedidosPendientesDTO {
    const sucursal = pedidos[0].sucursal;

    return {
      sucursal: sucursal?.nombre || 'SIN SUCURSAL',
      total_pedidos: pedidos.length,
      monto_total: pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0),
      pedidos: pedidos.map((p) => ({
        id: p.id,
        cliente: this.nombreCliente(p.cliente),
        total: Number(p.total) || 0,
        tipo_entrega: p.tipo_entrega,
        created_at: formatDateLocal(p.created_at),
        horas_transcurridas: this.horasDesde(p.created_at),
      })),
    };
  }

  private formatearPedidoEstancado(p: Pedido): PedidoEstancadoDTO {
    const horas = this.horasDesde(p.created_at);

    return {
      id: p.id,
      cliente: this.nombreCliente(p.cliente),
      sucursal: p.sucursal?.nombre || p.sucursal?.nombre || 'N/D',
      total: Number(p.total) || 0,
      tipo_entrega: p.tipo_entrega,
      nombre_finca: p.nombre_finca || null,
      direccion_entrega: p.direccion_entrega || null,
      created_at: formatDateLocal(p.created_at),
      horas_transcurridas: horas,
      es_critico: horas > HORAS_CRITICO,
    };
  }

  private horasDesde(fecha: Date | string): number {
    const f = fecha instanceof Date ? fecha : new Date(fecha);
    return Math.floor((Date.now() - f.getTime()) / (1000 * 60 * 60));
  }

  private nombreCliente(cliente?: any): string {
    if (!cliente) return 'N/D';
    return (
      cliente.nombre ||
      `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() ||
      cliente.email ||
      'N/D'
    );
  }
}
