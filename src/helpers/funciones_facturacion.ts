import { BadRequestException } from '@nestjs/common';

export function validarVigenciaAutorizacion(fechaAutorizacion: Date): void {
  const ahora = new Date();
  const vigenciaHoras = 24;
  const tiempoTranscurrido = ahora.getTime() - fechaAutorizacion.getTime();
  const tiempoLimiteMs = vigenciaHoras * 60 * 60 * 1000;

  if (tiempoTranscurrido > tiempoLimiteMs) {
    throw new BadRequestException(
      'La autorización de cancelación ha expirado. Solicite una nueva autorización.',
    );
  }
}

export function validarCancelacionMismoDia(fechaCreacion: Date): void {
  const hoy = new Date();
  const fechaFactura = new Date(fechaCreacion);

  const hoyNormalizado = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
  );
  const fechaFacturaNormalizada = new Date(
    fechaFactura.getFullYear(),
    fechaFactura.getMonth(),
    fechaFactura.getDate(),
  );

  if (hoyNormalizado.getTime() !== fechaFacturaNormalizada.getTime()) {
    throw new BadRequestException(
      'Solo se pueden cancelar facturas el mismo día en que fueron generadas',
    );
  }
}

export function validarTiempoCancelacion(fechaCreacion: Date): void {
  const ahora = new Date();
  const fechaFactura = new Date(fechaCreacion);

  const tiempoLimiteMs = 3 * 60 * 60 * 1000;
  const tiempoTranscurrido = ahora.getTime() - fechaFactura.getTime();

  if (tiempoTranscurrido > tiempoLimiteMs) {
    throw new BadRequestException(
      'Ha excedido el tiempo límite para cancelar esta factura. Contacte a un administrador.',
    );
  }
}
