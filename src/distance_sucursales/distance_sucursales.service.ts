import { Injectable } from '@nestjs/common';
import { Client, UnitSystem } from '@googlemaps/google-maps-services-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DistanceSucursalesService {
  private googleMapsClient: Client;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.googleMapsClient = new Client({});
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  async calculateDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<{ distance: number; duration: number }> {
    try {
      const response = await this.googleMapsClient.distancematrix({
        params: {
          origins: [`${originLat},${originLng}`],
          destinations: [`${destLat},${destLng}`],
          key: this.apiKey,
          units: UnitSystem.metric,
        },
      });

      if (response.data.rows[0].elements[0].status === 'OK') {
        return {
          distance: response.data.rows[0].elements[0].distance.value / 1000,
          duration: response.data.rows[0].elements[0].duration.value / 60,
        };
      }
      throw new Error('No se pudo calcular la distancia');
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }

  calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
