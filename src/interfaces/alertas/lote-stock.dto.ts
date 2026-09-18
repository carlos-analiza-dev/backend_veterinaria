export class LoteStockDTO {
  id: string;
  producto: string;
  sucursal: string;
  cantidad: number;
  costo_por_unidad: number | null;
  valor_total: number;
  es_bajo: boolean;
  es_limitado: boolean;
}

export class ResumenStockSucursalDTO {
  sucursal: string;
  moneda: string;
  total_lotes: number;
  total_bajos: number;
  total_limitados: number;
  lotes: LoteStockDTO[];
}
