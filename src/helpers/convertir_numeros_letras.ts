export function convertirEnterosALetras(numero: number): string {
  if (numero === 0) return 'cero';
  if (numero < 0) return 'menos ' + convertirEnterosALetras(Math.abs(numero));

  const unidades = [
    '',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
  ];

  const decenas = [
    '',
    'diez',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ];

  const especiales = [
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciséis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ];

  const centenas = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ];

  if (numero === 100) return 'cien';
  if (numero === 1000) return 'mil';

  if (numero < 10) {
    return unidades[numero];
  }

  if (numero < 20) {
    return especiales[numero - 10];
  }

  if (numero < 100) {
    const decena = Math.floor(numero / 10);
    const unidad = numero % 10;

    if (unidad === 0) {
      return decenas[decena];
    }

    if (decena === 2) {
      switch (unidad) {
        case 1:
          return 'veintiuno';
        case 2:
          return 'veintidós';
        case 3:
          return 'veintitrés';
        case 6:
          return 'veintiséis';
        default:
          return `veinti${unidades[unidad]}`;
      }
    }

    return `${decenas[decena]} y ${unidades[unidad]}`;
  }

  if (numero < 1000) {
    const centena = Math.floor(numero / 100);
    const resto = numero % 100;

    if (centena === 1 && resto === 0) return 'cien';
    if (resto === 0) return centenas[centena];

    return `${centenas[centena]} ${convertirEnterosALetras(resto)}`;
  }

  if (numero < 1000000) {
    const miles = Math.floor(numero / 1000);
    const resto = numero % 1000;

    const milesTexto =
      miles === 1 ? 'mil' : `${convertirEnterosALetras(miles)} mil`;

    if (resto === 0) return milesTexto;

    return `${milesTexto} ${convertirEnterosALetras(resto)}`;
  }

  if (numero < 1000000000) {
    const millones = Math.floor(numero / 1000000);
    const resto = numero % 1000000;

    const millonesTexto =
      millones === 1
        ? 'un millón'
        : `${convertirEnterosALetras(millones)} millones`;

    if (resto === 0) return millonesTexto;

    return `${millonesTexto} ${convertirEnterosALetras(resto)}`;
  }

  return 'Número demasiado grande';
}

export function convertirNumeroALetras(numero: number): string {
  const enteros = Math.floor(numero);
  const decimales = Math.round((numero - enteros) * 100);

  if (enteros === 0) {
    return `cero con ${decimales.toString().padStart(2, '0')}/100`;
  }

  let resultado = convertirEnterosALetras(enteros);

  if (decimales > 0) {
    resultado += ` con ${decimales.toString().padStart(2, '0')}/100`;
  } else {
    resultado += ' con 00/100';
  }

  return resultado;
}
