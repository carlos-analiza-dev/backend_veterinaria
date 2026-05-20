export const formatearFecha = (fecha: Date | string) => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatearFechaEs = (fecha: Date): string => {
  if (!fecha) return null;
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
