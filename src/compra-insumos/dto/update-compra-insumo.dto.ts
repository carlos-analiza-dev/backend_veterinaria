import { PartialType } from '@nestjs/mapped-types';
import { CreateCompraInsumoDto } from './create-compra-insumo.dto';
import { CreateCompraAgroInsumoDto } from './create-compra-agro-insumo.dto';

export class UpdateCompraInsumoDto extends PartialType(CreateCompraInsumoDto) {}

export class UpdateCompraAgroInsumoDto extends PartialType(
  CreateCompraAgroInsumoDto,
) {}
