export enum IntensidadCelosAnimal {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
  MUY_ALTO = 'MUY_ALTO',
}

export enum DeteccionCelo {
  VISUAL = 'VISUAL',
  PARCHE = 'PARCHE',
  PODOMETRO = 'PODOMETRO',
  COLLAR_ACTIVIDAD = 'COLLAR_ACTIVIDAD',
  ULTRASONIDO = 'ULTRASONIDO',
  MONTA_NATURAL = 'MONTA_NATURAL',
}

export enum EstadoCeloAnimal {
  ACTIVO = 'ACTIVO', // El animal está en celo
  FINALIZADO = 'FINALIZADO', // Terminó el celo
  SERVIDO = 'SERVIDO', // Se realizó servicio en este celo
  PREÑADO = 'PREÑADO', // El servicio fue exitoso
  NO_FECUNDADO = 'NO_FECUNDADO', // Hubo servicio pero no hubo preñez
  SIN_SERVICIO = 'SIN_SERVICIO', // Terminó el celo sin servicio
}
