import { ProfileImage } from 'src/profile_images/entities/profile_image.entity';
import { UnidadVenta } from 'src/sub_servicios/entities/sub_servicio.entity';

export interface ResponseAgroProductosInterface {
  productos: ProductoAgro[];
  total: number;
}

export interface ProductoAgro {
  id: string;
  nombre: string;
  unidad_venta: UnidadVenta;
  tipo_fraccionamiento: UnidadVenta;
  isActive: boolean;
  disponible: boolean;
  codigo_barra: string;
  codigo: string;
  atributos: string;
  precio: string;
  costo: string;
  es_compra_bodega: boolean;
  compra_minima: number;
  distribucion_minima: number;
  venta_minima: number;
  unidad_fraccionamiento: number;
  contenido: number;
  componentes: Componente[];
  tipos_uso: string[];
  forma_uso: string;
  indicaciones: string[];
  createdAt: Date;
  updatedAt: Date;
  pais: Pais;
  marca: Marca;
  proveedor: Proveedor;
  categoria: Categoria;
  subcategoria: Categoria;
  tipo_producto: TipoProducto;
  tax: Tax;
  images: ProfileImage[] | [];
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  tipo?: string;
  is_active: boolean;
  is_market: boolean;
  destacada?: boolean;
  created_at: Date;
  updated_at: Date;
  codigo?: string;
}

export interface Componente {
  nombre: string;
  unidad: string;
  cantidad: string;
}

export interface Marca {
  id: string;
  nombre: string;
  pais_origen?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  is_market: boolean;
  descripcion?: string;
}

export interface Pais {
  id: string;
  nombre: string;
  code: string;
  code_phone: string;
  nombre_moneda: string;
  simbolo_moneda: string;
  nombre_documento: string;
  isActive: boolean;
}

export interface Proveedor {
  id: string;
  nit_rtn: string;
  nrc: string;
  nombre_legal: string;
  complemento_direccion: string;
  telefono: string;
  correo: string;
  nombre_contacto: string;
  plazo: null;
  tipo_escala: string;
  is_active: boolean;
  tipo_pago_default: string;
  created_at: Date;
  updated_at: Date;
}

export interface Tax {
  id: string;
  nombre: string;
  porcentaje: string;
}

export interface TipoProducto {
  id: string;
  nombre: string;
  descripcion: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  categoria?: Categoria;
}
