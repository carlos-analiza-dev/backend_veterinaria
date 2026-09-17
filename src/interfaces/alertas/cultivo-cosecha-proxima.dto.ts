export class CultivoCosechaProximaDTO {
  id: string;
  nombre_cultivo: string;
  variedad: string | null;
  tipo_cultivo: string;
  finca: string;
  area_sembrada: number;
  unidad_medida: string | null;
  fecha_siembra: string | null;
  fecha_cosecha_estimada: string;
  dias_restantes: number;
  produccion_estimada: number | null;
  unidad_produccion: string | null;
  temporada: string | null;
  es_hoy: boolean;
  es_esta_semana: boolean;
}

export class CultivoCosechaVencidaDTO {
  id: string;
  nombre_cultivo: string;
  variedad: string | null;
  tipo_cultivo: string;
  finca: string;
  area_sembrada: number;
  unidad_medida: string | null;
  fecha_siembra: string | null;
  fecha_cosecha_estimada: string;
  dias_vencida: number;
  produccion_estimada: number | null;
  unidad_produccion: string | null;
  temporada: string | null;
  es_5_dias: boolean;
  es_10_dias: boolean;
  es_15_dias: boolean;
  es_urgente: boolean;
}
