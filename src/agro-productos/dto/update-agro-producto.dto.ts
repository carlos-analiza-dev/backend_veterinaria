import { PartialType } from '@nestjs/mapped-types';
import { CreateAgroProductoDto } from './create-agro-producto.dto';

export class UpdateAgroProductoDto extends PartialType(CreateAgroProductoDto) {}
