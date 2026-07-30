import { PartialType } from '@nestjs/mapped-types';
import { CreateDescuentosClienteDto } from './create-descuentos_cliente.dto';
import { CreateDescuentosAgroClienteDto } from './create-descuentos-agro-cliente.dto';

export class UpdateDescuentosClienteDto extends PartialType(
  CreateDescuentosClienteDto,
) {}

export class UpdateDescuentosAgroClienteDto extends PartialType(
  CreateDescuentosAgroClienteDto,
) {}
