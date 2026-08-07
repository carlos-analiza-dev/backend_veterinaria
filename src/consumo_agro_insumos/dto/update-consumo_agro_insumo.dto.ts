import { PartialType } from '@nestjs/mapped-types';
import { CreateConsumoAgroInsumoDto } from './create-consumo_agro_insumo.dto';

export class UpdateConsumoAgroInsumoDto extends PartialType(CreateConsumoAgroInsumoDto) {}
