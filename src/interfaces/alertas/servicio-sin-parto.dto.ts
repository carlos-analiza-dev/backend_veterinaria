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
