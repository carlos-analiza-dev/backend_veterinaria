import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoProductoDto } from './create-tipo_producto.dto';

export class UpdateTipoProductoDto extends PartialType(CreateTipoProductoDto) {}
