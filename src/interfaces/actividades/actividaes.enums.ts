export enum TipoActividad {
  SIEMBRA = 'siembra',
  REPARACION = 'reparacion',
  LIMPIEZA = 'limpieza',
  MANTENIMIENTO = 'mantenimiento',
  ALIMENTACION = 'alimentacion',
  VACUNACION = 'vacunacion',
  COSECHA = 'cosecha',
  RIEGO = 'riego',
  PODA = 'poda',
  FUMIGACION = 'fumigacion',
  OTRO = 'otro',
}

export enum EstadoActividad {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export enum FrecuenciaActividad {
  DIARIA = 'diaria',
  SEMANAL = 'semanal',
}
