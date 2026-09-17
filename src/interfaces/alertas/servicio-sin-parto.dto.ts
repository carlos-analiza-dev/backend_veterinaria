export interface ServicioSinPartoDTO {
  hembra: string;
  especie: string;
  tipo_servicio: string;
  fecha_servicio: string;
  macho: string;
  tecnico_responsable: string;
  dias_transcurridos: number;
  dias_gestacion_esperados: number;
  dias_atraso_parto: number;
  observaciones: string | null;
}

export interface PartoProximoDTO {
  hembra: string;
  especie: string;
  tipo_servicio: string;
  fecha_servicio: string;
  fecha_probable_parto: string;
  macho: string;
  tecnico_responsable: string;
  dias_gestacion_esperados: number;
  dias_restantes: number;
  rango_gestacion: string;
  observaciones: string | null;
  es_vencido: boolean;
  es_hoy: boolean;
  es_proximo: boolean;
}
