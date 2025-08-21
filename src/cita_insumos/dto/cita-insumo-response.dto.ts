import { CitaInsumo } from '../entities/cita_insumo.entity';

export class CitaInsumoResponseDto {
  id: string;
  citaId: string;
  insumoId: string;
  insumoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;

  static fromEntity(entity: CitaInsumo): CitaInsumoResponseDto {
    const dto = new CitaInsumoResponseDto();
    dto.id = entity.id;
    dto.citaId = entity.cita.id;
    dto.insumoId = entity.insumo.id;
    dto.insumoNombre = entity.insumo.nombre;
    dto.cantidad = entity.cantidad;
    dto.precioUnitario = entity.precioUnitario;
    dto.subtotal = entity.cantidad * entity.precioUnitario;
    return dto;
  }
}
