import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateDetallesNotaCreditoDto } from 'src/detalles_nota_credito/dto/create-detalles_nota_credito.dto';

export class CreateNotaCreditoDto {
  @IsUUID('4', { message: 'El campo "factura_id" debe ser un UUID válido.' })
  factura_id: string;

  @IsNumber({}, { message: 'El campo "monto" debe ser un número válido.' })
  @IsPositive({ message: 'El campo "monto" debe ser mayor que 0.' })
  monto: number;

  @IsString({ message: 'El campo "motivo" debe ser una cadena de texto.' })
  @MaxLength(500, {
    message: 'El campo "motivo" no debe exceder 500 caracteres.',
  })
  motivo: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateDetallesNotaCreditoDto)
  @ArrayMinSize(1, {
    message: 'Debe incluir al menos un detalle en la nota de crédito.',
  })
  detalles?: CreateDetallesNotaCreditoDto[];
}
