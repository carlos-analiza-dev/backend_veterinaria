import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { EstadoServicio } from 'src/interfaces/servicios-reproductivos.enum';

export class UpdateEstadoServicioDto {
  @IsOptional()
  @IsEnum(EstadoServicio)
  estado?: EstadoServicio;

  @IsOptional()
  @IsBoolean()
  exitoso?: boolean;
}
