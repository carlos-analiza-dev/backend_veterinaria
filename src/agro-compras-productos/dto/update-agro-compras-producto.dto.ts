import { PartialType } from '@nestjs/mapped-types';
import { CreateAgroComprasProductoDto } from './create-agro-compras-producto.dto';

export class UpdateAgroComprasProductoDto extends PartialType(CreateAgroComprasProductoDto) {}
