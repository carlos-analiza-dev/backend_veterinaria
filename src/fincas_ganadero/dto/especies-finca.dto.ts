export class EspeciesFincaDto {
  id: string;
  nombre_finca: string;
  especies: { especie: string; cantidad: number }[];
  cantidad_total_especies: number;
}
