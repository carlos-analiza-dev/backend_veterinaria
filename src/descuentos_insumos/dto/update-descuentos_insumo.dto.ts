import { PartialType } from '@nestjs/mapped-types';
import { CreateDescuentosInsumoDto } from './create-descuentos_insumo.dto';

export class UpdateDescuentosInsumoDto extends PartialType(CreateDescuentosInsumoDto) {}
