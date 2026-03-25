import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EstadoParto, TipoParto } from 'src/interfaces/partos.enums';
import { CriaDto } from './cria.dto';

export class CreatePartoAnimalDto {
  @IsUUID('4', { message: 'Debe seleccionar una hembra.' })
  hembra_id: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'Debe seleccionar un servicio.',
  })
  servicio_id?: string;

  @Type(() => Date)
  @IsDate({ message: 'La fecha de parto debe ser una fecha válida.' })
  fecha_parto: Date;

  @IsNumber({}, { message: 'El número de parto debe ser un valor numérico.' })
  @Min(1, { message: 'El número de parto debe ser al menos 1.' })
  @Max(50, { message: 'El número de parto no puede ser mayor a 50.' })
  numero_parto: number;

  @IsOptional()
  @IsEnum(TipoParto, {
    message: 'El tipo de parto no es válido. Debe ser un valor permitido.',
  })
  tipo_parto?: TipoParto;

  @IsOptional()
  @IsEnum(EstadoParto, {
    message: 'El estado del parto no es válido.',
  })
  estado?: EstadoParto;

  @IsOptional()
  @IsNumber({}, { message: 'El número de crías debe ser un valor numérico.' })
  @Min(1, { message: 'Debe registrar al menos 1 cría.' })
  @Max(20, { message: 'No puede registrar más de 20 crías.' })
  numero_crias?: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'El número de crías vivas debe ser un valor numérico.',
    },
  )
  @Min(0, { message: 'El número de crías vivas no puede ser negativo.' })
  numero_crias_vivas?: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'El número de crías muertas debe ser un valor numérico.',
    },
  )
  @Min(0, { message: 'El número de crías muertas no puede ser negativo.' })
  numero_crias_muertas?: number;

  @IsOptional()
  @IsArray({ message: 'Las crías deben enviarse en un arreglo.' })
  @ValidateNested({ each: true })
  @Type(() => CriaDto)
  crias?: CriaDto[];

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto.' })
  observaciones?: string;

  @IsOptional()
  @IsString({ message: 'Las complicaciones deben ser texto.' })
  complicaciones?: string;

  @IsOptional()
  @IsString({ message: 'La atención veterinaria debe ser texto.' })
  atencion_veterinaria?: string;

  @IsOptional()
  @IsString({
    message: 'El nombre del veterinario responsable debe ser texto.',
  })
  veterinario_responsable?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Los días de gestación deben ser un número.' })
  @Min(0, { message: 'Los días de gestación no pueden ser negativos.' })
  @Max(400, { message: 'Los días de gestación no pueden ser mayores a 400.' })
  dias_gestacion?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Las semanas de gestación deben ser un número.' })
  @Min(0, { message: 'Las semanas de gestación no pueden ser negativas.' })
  @Max(60, { message: 'Las semanas de gestación no pueden ser mayores a 60.' })
  semanas_gestacion?: number;
}
