import { PartialType } from '@nestjs/mapped-types';
import { CreateDescuentosProductoDto } from './create-descuentos_producto.dto';

export class UpdateDescuentosProductoDto extends PartialType(CreateDescuentosProductoDto) {}
