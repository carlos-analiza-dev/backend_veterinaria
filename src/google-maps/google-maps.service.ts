import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

@Injectable()
export class GoogleMapsService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  async obtenerDistanciaGoogleMaps(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): Promise<number | null> {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat1},${lon1}&destination=${lat2},${lon2}&key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes?.length > 0 && data.routes[0].legs?.length > 0) {
        const distanciaMetros = data.routes[0].legs[0].distance.value;
        return distanciaMetros / 1000;
      }

      return null;
    } catch (error) {
      throw new HttpException('Error al consultar Google Maps', 500);
    }
  }

  async obtenerTiempoViajeGoogleMaps(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    modo: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  ): Promise<{
    tiempoTexto: string | null;
    tiempoSegundos: number | null;
    distanciaTexto: string | null;
    distanciaMetros: number | null;
  } | null> {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat1},${lon1}&destination=${lat2},${lon2}&mode=${modo}&key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes?.length > 0 && data.routes[0].legs?.length > 0) {
        const leg = data.routes[0].legs[0];
        return {
          tiempoTexto: leg.duration.text,
          tiempoSegundos: leg.duration.value,
          distanciaTexto: leg.distance.text,
          distanciaMetros: leg.distance.value,
        };
      }

      return null;
    } catch (error) {
      throw new HttpException('Error al consultar Google Maps', 500);
    }
  }

  calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const R = 6371;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
