export class PublicacionAlertaDTO {
  id: string;
  nombre: string;
  animal: string | null;
  precio: number;
  moneda: string;
  categoria: string;
  subcategoria: string;
  views: number;
  dias_publicada: number;
  fecha_publicacion: string;
}

export class ResumenPublicacionesVendedorDTO {
  vendedor: string;
  email: string;
  total_publicaciones: number;

  sin_interaccion: PublicacionAlertaDTO[];
  muchas_views_sin_vender: PublicacionAlertaDTO[];
  vendidas_activas: PublicacionAlertaDTO[];
}
