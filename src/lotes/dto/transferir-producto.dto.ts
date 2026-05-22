import {
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class TransferirProductoDto {
  @IsUUID()
  productoId: string;

  @IsUUID()
  sucursalOrigenId: string;

  @IsUUID()
  sucursalDestinoId: string;

  @IsNumber()
  @IsPositive()
  cantidad: number;
}