import { PartialType } from '@nestjs/mapped-types';
import { CreateEscalasAgroProductoDto } from './create-escala-agro-producto.dto';

export class UpdateAgroEscalaProductoDto extends PartialType(
  CreateEscalasAgroProductoDto,
) {}
