import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHistorialDetalleDto {
  @IsUUID()
  historialId: string;

  @IsOptional()
  @IsUUID()
  subServicioId?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
