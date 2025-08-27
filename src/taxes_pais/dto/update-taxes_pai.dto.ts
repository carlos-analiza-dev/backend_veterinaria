import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxesPaiDto } from './create-taxes_pai.dto';

export class UpdateTaxesPaiDto extends PartialType(CreateTaxesPaiDto) {}
