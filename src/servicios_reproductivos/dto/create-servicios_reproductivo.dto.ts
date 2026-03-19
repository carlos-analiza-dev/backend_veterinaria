import {
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsObject,
  ValidateNested,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoServicio,
  EstadoServicio,
} from 'src/interfaces/servicios-reproductivos.enum';
import { CreateDetallesServicioReproductivoDto } from 'src/detalles_servicio_reproductivo/dto/create-detalles_servicio_reproductivo.dto';

class MetadataDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duracion_minutos?: number;

  @IsOptional()
  @IsString()
  condiciones_climaticas?: string;

  @IsOptional()
  @IsString()
  evaluacion_macho?: string;
}

export class CreateServiciosReproductivoDto {
  @IsUUID()
  hembra_id: string;

  @IsOptional()
  @IsUUID()
  macho_id?: string;

  @IsEnum(TipoServicio)
  tipo_servicio: TipoServicio;

  @IsOptional()
  @IsEnum(EstadoServicio)
  estado?: EstadoServicio;

  @IsDateString()
  fecha_servicio: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numero_servicio?: number;

  @IsOptional()
  @IsUUID()
  celo_id?: string;

  @IsOptional()
  @IsString()
  dosis_semen?: string;

  @IsOptional()
  @IsString()
  proveedor_semen?: string;

  @IsOptional()
  @IsString()
  tecnico_responsable?: string;

  @IsOptional()
  @IsBoolean()
  exitoso?: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetallesServicioReproductivoDto)
  detalles?: CreateDetallesServicioReproductivoDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}
