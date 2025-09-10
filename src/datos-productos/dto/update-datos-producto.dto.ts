import { PartialType } from '@nestjs/mapped-types';
import { CreateDatosProductoDto } from './create-datos-producto.dto';

export class UpdateDatosProductoDto extends PartialType(CreateDatosProductoDto) {}