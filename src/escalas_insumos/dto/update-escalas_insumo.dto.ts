import { PartialType } from '@nestjs/mapped-types';
import { CreateEscalasInsumoDto } from './create-escalas_insumo.dto';

export class UpdateEscalasInsumoDto extends PartialType(CreateEscalasInsumoDto) {}
