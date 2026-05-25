import { Sucursal } from 'src/sucursales/entities/sucursal.entity';

export class SucursalCercanaDto {
  sucursal: Sucursal;
  distancia_km: number;
  tiempo_estimado_minutos?: number;
  distancia_linea_recta_km?: number;
}
