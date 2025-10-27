export interface DatosVentasMensuales {
  mes: string;
  ingresos: number;
  ganancias: number;
  cantidad_ventas: number;
}

export interface DatosCategorias {
  nombre: string;
  valor: number;
  cantidad: number;
  color?: string;
}

export interface MetricasDashboard {
  ingresos_totales: number;
  tasa_conversion: number;
  clientes_activos: number;
  crecimiento_ingresos: number;
  crecimiento_conversion: number;
  crecimiento_clientes: number;
}

export interface DashboardData {
  metricas: MetricasDashboard;
  ventas_mensuales: DatosVentasMensuales[];
  categorias: DatosCategorias[];
  productos_mas_vendidos: Array<{
    nombre: string;
    cantidad_vendida: number;
    total_ventas: number;
  }>;
}

export interface DatosVentasMensuales {
  mes: string;
  ingresos: number;
  ganancias: number;
  costo: number;
  cantidad_ventas: number;
}

export interface RendimientoMensualResponse {
  datosVentas: DatosVentasMensuales[];
  periodo: string;
}
