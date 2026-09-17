export class PedidoEstancadoDTO {
  id: string;
  cliente: string;
  sucursal: string;
  total: number;
  tipo_entrega: string;
  nombre_finca: string | null;
  direccion_entrega: string | null;
  created_at: string;
  horas_transcurridas: number;
  es_critico: boolean; // > 48h
}

export class ResumenPedidosPendientesDTO {
  sucursal: string;
  total_pedidos: number;
  monto_total: number;
  pedidos: Array<{
    id: string;
    cliente: string;
    total: number;
    tipo_entrega: string;
    created_at: string;
    horas_transcurridas: number;
  }>;
}
