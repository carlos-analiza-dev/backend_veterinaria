import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateProduccionAgricolaDto,
  CreateProduccionAlternativaDto,
  CreateProduccionApiculturaDto,
  CreateProduccionForrajesInsumoDto,
  ProduccionGanaderaDto,
} from './dtos.dto';

export class CreateProduccionFincaDto {
  @IsUUID()
  @IsNotEmpty({ message: 'La seleccion de finca es obligatorio' })
  fincaId: string;

  @IsUUID()
  @IsNotEmpty({
    message: 'No se encontro el usuario que realiza esta peticion',
  })
  userId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProduccionGanaderaDto)
  ganadera?: ProduccionGanaderaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProduccionAgricolaDto)
  agricola?: CreateProduccionAgricolaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProduccionApiculturaDto)
  apicultura?: CreateProduccionApiculturaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProduccionForrajesInsumoDto)
  forrajesInsumo?: CreateProduccionForrajesInsumoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProduccionAlternativaDto)
  alternativa?: CreateProduccionAlternativaDto;

  @IsBoolean()
  @IsOptional()
  produccion_mixta?: boolean = false;

  @IsBoolean()
  @IsOptional()
  transformacion_artesanal?: boolean = false;

  @IsBoolean()
  @IsOptional()
  consumo_propio?: boolean = false;

  @IsBoolean()
  @IsOptional()
  produccion_venta?: boolean = false;
}
