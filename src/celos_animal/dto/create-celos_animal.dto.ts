import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DeteccionCelo,
  IntensidadCelosAnimal,
} from 'src/interfaces/celos.animal.enum';

class SignosObservadosDto {
  @IsBoolean({ message: 'El campo "monta_otros" debe ser verdadero o falso' })
  monta_otros: boolean;

  @IsBoolean({ message: 'El campo "acepta_monta" debe ser verdadero o falso' })
  acepta_monta: boolean;

  @IsBoolean({ message: 'El campo "inquietud" debe ser verdadero o falso' })
  inquietud: boolean;

  @IsString({ message: 'Las secreciones deben ser texto' })
  secreciones: string;

  @IsBoolean({
    message: 'El campo "vulva_inflamada" debe ser verdadero o falso',
  })
  vulva_inflamada: boolean;

  @IsArray({ message: 'El campo "otros" debe ser un arreglo' })
  @IsString({ each: true, message: 'Cada elemento de "otros" debe ser texto' })
  otros: string[];
}

export class CreateCelosAnimalDto {
  @IsUUID('4', { message: 'El ID del animal no es válido' })
  animalId: string;

  @IsDateString(
    {},
    {
      message:
        'La fecha de inicio debe tener formato válido (YYYY-MM-DDTHH:mm:ss)',
    },
  )
  fechaInicio: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha fin debe tener formato válido' })
  fechaFin?: string;

  @IsOptional()
  @IsInt({ message: 'El número de celo debe ser un número entero' })
  @Min(1, { message: 'El número de celo debe ser mayor o igual a 1' })
  numeroCelo?: number;

  @IsOptional()
  @IsEnum(IntensidadCelosAnimal, {
    message: `La intensidad debe ser uno de los siguientes valores: ${Object.values(IntensidadCelosAnimal).join(', ')}`,
  })
  intensidad?: IntensidadCelosAnimal;

  @IsOptional()
  @IsEnum(DeteccionCelo, {
    message: `El método de detección debe ser: ${Object.values(DeteccionCelo).join(', ')}`,
  })
  metodo_deteccion?: DeteccionCelo;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;

  @IsOptional()
  @IsObject({ message: 'Los signos observados deben ser un objeto válido' })
  @ValidateNested()
  @Type(() => SignosObservadosDto)
  signos_observados?: SignosObservadosDto;
}
