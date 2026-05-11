import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { TipoCultivoEnum } from 'src/interfaces/cultivos/tipo-cultivo.enums';

export class CreateCultivoDto {
  @IsString({
    message: 'El nombre del cultivo debe ser un texto válido',
  })
  @Length(2, 150, {
    message: 'El nombre del cultivo debe tener entre 2 y 150 caracteres',
  })
  nombre_cultivo: string;

  @IsOptional()
  @IsString({
    message: 'La variedad debe ser un texto válido',
  })
  @Length(2, 100, {
    message: 'La variedad debe tener entre 2 y 100 caracteres',
  })
  variedad?: string;

  @IsEnum(TipoCultivoEnum, {
    message: 'El tipo de cultivo debe ser uno de los valores permitidos',
  })
  tipo_cultivo: TipoCultivoEnum;

  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El área sembrada debe ser un número válido',
    },
  )
  @Min(0, {
    message: 'El área sembrada no puede ser menor a 0',
  })
  area_sembrada: number;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de siembra debe tener un formato válido',
    },
  )
  fecha_siembra?: Date;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha estimada de cosecha debe tener un formato válido',
    },
  )
  fecha_cosecha_estimada?: Date;

  @IsOptional()
  @IsString({
    message: 'La temporada debe ser un texto válido',
  })
  @Length(2, 100, {
    message: 'La temporada debe tener entre 2 y 100 caracteres',
  })
  temporada?: string;

  @IsUUID('4', {
    message: 'El ID de la finca no es válido',
  })
  fincaId: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser verdadero o falso',
  })
  isActive?: boolean;
}
