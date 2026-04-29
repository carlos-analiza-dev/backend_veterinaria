import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from 'src/interfaces/planillas.enums';

export class PagoDto {
  @IsUUID()
  @IsNotEmpty()
  detalleId: string;

  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;
}

export class RegistrarPagosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PagoDto)
  @IsNotEmpty()
  pagos: PagoDto[];
}
