import { PartialType } from '@nestjs/mapped-types';
import { CreateCompraInsumoDto } from './create-compra-insumo.dto';

export class UpdateCompraInsumoDto extends PartialType(CreateCompraInsumoDto) {}