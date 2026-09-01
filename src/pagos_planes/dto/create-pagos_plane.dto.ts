import {
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoPrecio } from '../entities/pagos_plane.entity';

export class TarjetaDto {
  @IsString()
  @Length(13, 19)
  numeroTarjeta: string;

  @IsString()
  @Length(3, 4)
  cvv: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mesVencimiento: number;

  @IsInt()
  @Min(new Date().getFullYear())
  anioVencimiento: number;
}

export class CreatePagosPlaneDto {
  @IsUUID('4', {
    message: 'El paqueteId debe ser un UUID válido',
  })
  paqueteId: string;

  @IsEnum(TipoPrecio, {
    message: 'El tipoPrecio debe ser MENSUAL o ANUAL',
  })
  tipoPrecio: TipoPrecio;

  @ValidateNested()
  @Type(() => TarjetaDto)
  tarjeta: TarjetaDto;
}
