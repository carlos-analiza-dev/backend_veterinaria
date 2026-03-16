import { IsDateString, IsEnum, IsNumber, IsUUID } from 'class-validator';
import {
  OrigenAlimento,
  TipoAlimento,
} from 'src/interfaces/alimentacion.interface';
import { UnidadMedida } from 'src/interfaces/unidad-medida';

export class CreateAlimentacionAnimalDto {
  @IsEnum(TipoAlimento, {
    message:
      'El tipo de alimento no es válido. Valores permitidos: Forrajes, Concentrados o Núcleos.',
  })
  tipoAlimento: TipoAlimento;

  @IsEnum(OrigenAlimento, {
    message:
      'El origen del alimento no es válido. Debe ser: comprado, producido o comprado y producido.',
  })
  origen: OrigenAlimento;

  @IsNumber(
    {},
    {
      message: 'La cantidad debe ser un número válido.',
    },
  )
  cantidad: number;

  @IsEnum(UnidadMedida, {
    message:
      'La unidad de medida no es válida. Debe ser una unidad permitida (ej: KILOGRAMO, GRAMO, LIBRA).',
  })
  unidad: UnidadMedida;

  @IsNumber(
    {},
    {
      message: 'El costo diario debe ser un número válido.',
    },
  )
  costo_diario: number;

  @IsDateString(
    {},
    {
      message: 'La fecha debe tener un formato válido (YYYY-MM-DD).',
    },
  )
  fecha: Date;

  @IsUUID('4', {
    message: 'Debe seleccionar un animal obligatoriamente',
  })
  animalId: string;
}
