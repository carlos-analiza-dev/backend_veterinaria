export class FacturaPendienteDTO {
  id: string;
  numero_factura: string;
  cliente: string;
  fecha_generacion: string;
  total: number;
  forma_pago: string;
  dias_transcurridos: number;
  es_urgente: boolean;
}

export class ResumenFacturasPendientesSucursalDTO {
  sucursal: string;
  moneda: string;
  total_facturas: number;
  monto_total: number;
  facturas: FacturaPendienteDTO[];
}
