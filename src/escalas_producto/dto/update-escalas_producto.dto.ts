import { PartialType } from '@nestjs/mapped-types';
import { CreateEscalasProductoDto } from './create-escalas_producto.dto';

export class UpdateEscalasProductoDto extends PartialType(CreateEscalasProductoDto) {}
