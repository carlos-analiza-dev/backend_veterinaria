import {
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PagoDto {
  @IsUUID()
  @IsNotEmpty()
  detalleId: string;

  @IsString()
  @IsNotEmpty()
  metodoPago: string;
}

export class RegistrarPagosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PagoDto)
  @IsNotEmpty()
  pagos: PagoDto[];
}
