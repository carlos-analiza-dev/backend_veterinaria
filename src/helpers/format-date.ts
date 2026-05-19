export const formatearFecha = (fecha: Date | string) => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
