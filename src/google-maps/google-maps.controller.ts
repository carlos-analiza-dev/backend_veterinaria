import { Controller, Get, Query } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';

@Controller('google-maps')
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) {}

  @Get('distancia')
  obtenerDistancia(
    @Query('lat1') lat1: number,
    @Query('lon1') lon1: number,
    @Query('lat2') lat2: number,
    @Query('lon2') lon2: number,
  ) {
    return this.googleMapsService.obtenerDistanciaGoogleMaps(
      lat1,
      lon1,
      lat2,
      lon2,
    );
  }

  @Get('tiempo')
  obtenerTiempo(
    @Query('lat1') lat1: number,
    @Query('lon1') lon1: number,
    @Query('lat2') lat2: number,
    @Query('lon2') lon2: number,
    @Query('modo')
    modo: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  ) {
    return this.googleMapsService.obtenerTiempoViajeGoogleMaps(
      lat1,
      lon1,
      lat2,
      lon2,
      modo,
    );
  }

  @Get('distancia-directa')
  calcularDistanciaDirecta(
    @Query('lat1') lat1: number,
    @Query('lon1') lon1: number,
    @Query('lat2') lat2: number,
    @Query('lon2') lon2: number,
  ) {
    const distancia = this.googleMapsService.calcularDistancia(
      lat1,
      lon1,
      lat2,
      lon2,
    );
    return { distanciaKm: distancia };
  }
}
