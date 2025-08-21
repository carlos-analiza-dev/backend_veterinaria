import { CitaProducto } from '../entities/cita_producto.entity';

export class CitaProductoResponseDto {
  id: string;
  citaId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;

  static fromEntity(entity: CitaProducto): CitaProductoResponseDto {
    const dto = new CitaProductoResponseDto();
    dto.id = entity.id;
    dto.citaId = entity.cita.id;
    dto.productoId = entity.producto.id;
    dto.productoNombre = entity.producto.nombre;
    dto.cantidad = entity.cantidad;
    dto.precioUnitario = entity.precioUnitario;
    dto.subtotal = entity.cantidad * entity.precioUnitario;
    return dto;
  }
}
