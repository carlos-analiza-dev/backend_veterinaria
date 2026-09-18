export class InsumoStockDTO {
  id: string;
  insumo: string;
  sucursal: string;
  cantidad: number;
  costo_por_unidad: number | null;
  valor_total: number;
  es_bajo: boolean;
  es_limitado: boolean;
}

export class ResumenStockInsumoSucursalDTO {
  sucursal: string;
  moneda: string;
  total_lotes: number;
  total_bajos: number;
  total_limitados: number;
  lotes: InsumoStockDTO[];
}
