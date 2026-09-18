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

export const formatDateISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function formatearFechaConTiempo(fecha: string | Date): string {
  const date = fecha instanceof Date ? fecha : new Date(fecha);

  if (isNaN(date.getTime())) return 'N/D';

  const dia = date.getDate();
  const mes = date.getMonth();
  const anio = date.getFullYear();

  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  const hora = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');

  return `${dia} de ${meses[mes]} del ${anio}`;
}
