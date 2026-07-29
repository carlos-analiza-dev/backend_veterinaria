import { PartialType } from '@nestjs/mapped-types';
import { CreateAgroImpuestoDto } from './create-agro_impuesto.dto';

export class UpdateAgroImpuestoDto extends PartialType(CreateAgroImpuestoDto) {}
