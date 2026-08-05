import { PartialType } from '@nestjs/mapped-types';
import { CreateInsumoDto } from './create-insumo.dto';
import { CreateAgroInsumoDto } from './create-agro-insumo.dto';

export class UpdateInsumoDto extends PartialType(CreateInsumoDto) {}
export class UpdateAgroInsumoDto extends PartialType(CreateAgroInsumoDto) {}
