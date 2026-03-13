import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  OrigenAlimento,
  TipoAlimento,
} from 'src/interfaces/alimentacion.interface';
import { UnidadMedida } from 'src/interfaces/unidad-medida';

export class CreateAlimentacionAnimalDto {
  @IsEnum(TipoAlimento)
  tipoAlimento: TipoAlimento;

  @IsEnum(OrigenAlimento)
  origen: OrigenAlimento;

  @IsNumber()
  cantidad: number;

  @IsEnum(UnidadMedida)
  unidad: UnidadMedida;

  @IsNumber()
  costo_diario: number;

  @IsDateString()
  fecha: Date;

  @IsUUID()
  animalId: string;
}
