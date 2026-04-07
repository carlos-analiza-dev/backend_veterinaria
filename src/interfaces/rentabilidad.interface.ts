export interface RentabilidadPorPeriodo {
  periodo: string;
  ingresos: number;
  gastos: number;
  rentabilidad: number;
  margen: number;
}

export interface RentabilidadPorCategoria {
  categoria: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  porcentaje: number;
}

export interface RentabilidadPorFinca {
  fincaId: string;
  fincaNombre: string;
  ingresos: number;
  gastos: number;
  rentabilidad: number;
  margen: number;
}

export interface RentabilidadGeneral {
  totalIngresos: number;
  totalGastos: number;
  rentabilidadNeta: number;
  margenRentabilidad: number;
  roi: number;
  mejorMes: RentabilidadPorPeriodo;
  peorMes: RentabilidadPorPeriodo;
}

export interface FiltrosRentabilidad {
  fechaInicio?: string;
  fechaFin?: string;
  fincaId?: string;
  especieId?: string;
}
