import { PartialType } from '@nestjs/mapped-types';
import { CreateEscalasInsumoDto } from './create-escalas_insumo.dto';
import { CreateEscalasAgroInsumoDto } from './create-escalas_agro_insumo.dto';

export class UpdateEscalasInsumoDto extends PartialType(
  CreateEscalasInsumoDto,
) {}

export class UpdateEscalasAgroInsumoDto extends PartialType(
  CreateEscalasAgroInsumoDto,
) {}
