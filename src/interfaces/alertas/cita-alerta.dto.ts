export class CitaRecordatorioDTO {
  id: string;
  codigo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracion: number;
  finca: string;
  medico: string;
  subServicio: string;
  cantidadAnimales: number;
  animales: string[];
  totalPagar: number;
  estado: string;
  motivoCancelacion: string | null;
  es_hoy: boolean;
  es_manana: boolean;
}

export class CitaVencidaDTO {
  id: string;
  codigo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  finca: string;
  medico: string;
  subServicio: string;
  cantidadAnimales: number;
  animales: string[];
  estado: string;
  dias_vencida: number;
}
