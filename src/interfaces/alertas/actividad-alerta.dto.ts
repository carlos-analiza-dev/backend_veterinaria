export class ActividadProximaDTO {
  id: string;
  finca: string;
  trabajador: string;
  tipo: string;
  fecha: string;
  estado: string;
  frecuencia: string;
  descripcion: string | null;
  dias_restantes: number;
  es_hoy: boolean;
  es_manana: boolean;
}

export class ActividadVencidaDTO {
  id: string;
  finca: string;
  trabajador: string;
  tipo: string;
  fecha: string;
  estado: string;
  frecuencia: string;
  descripcion: string | null;
  dias_vencida: number;
}
