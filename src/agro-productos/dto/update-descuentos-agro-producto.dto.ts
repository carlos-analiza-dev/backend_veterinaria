import { PartialType } from '@nestjs/mapped-types';
import { CreateDescuentosAgroProductoDto } from './create-descuento-agro-producto.dto';

export class UpdateAgroDescuentoProductoDto extends PartialType(
  CreateDescuentosAgroProductoDto,
) {}
