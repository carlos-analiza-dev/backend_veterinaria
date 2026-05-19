export interface PermisosInterface {
  id: string;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  permiso: Permiso;
}

export interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  url: string;
  modulo: string;
  isActive: boolean;
  createdAt: Date;
}
