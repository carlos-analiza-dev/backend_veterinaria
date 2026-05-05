import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { EstadoMaquinaria } from 'src/interfaces/maquinaria/maquinaria.enums';

export class CreateEquipoMaquinariaDto {
  @IsString({ message: 'El nombre del equipo es obligatorio' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  nombre: string;

  @IsString({
    message: 'El tipo de equipo es obligatorio (Ej: Tractor, Bomba)',
  })
  @MaxLength(100, { message: 'El tipo no puede exceder 100 caracteres' })
  tipo: string;

  @IsOptional()
  @IsString({ message: 'La marca debe ser texto' })
  marca?: string;

  @IsOptional()
  @IsString({ message: 'El modelo debe ser texto' })
  modelo?: string;

  @IsOptional()
  @IsString({ message: 'El número de serie debe ser texto' })
  numeroSerie?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de compra debe tener formato válido (YYYY-MM-DD)' },
  )
  fechaCompra?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El costo de compra debe ser un número válido' })
  @Min(0, { message: 'El costo de compra no puede ser negativo' })
  costoCompra?: number;

  @IsOptional()
  @IsEnum(EstadoMaquinaria, {
    message: `El estado debe ser uno de los siguientes: ${Object.values(EstadoMaquinaria).join(', ')}`,
  })
  estado?: EstadoMaquinaria;

  @IsOptional()
  @IsNumber({}, { message: 'Las horas de uso deben ser un número' })
  @Min(0, { message: 'Las horas de uso no pueden ser negativas' })
  horasUso?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La vida útil en horas debe ser un número' })
  @Min(0, { message: 'La vida útil no puede ser negativa' })
  vidaUtilHoras?: number;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la finca debe ser un UUID válido' })
  fincaId?: string;
}
