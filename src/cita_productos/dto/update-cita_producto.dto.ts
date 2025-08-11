import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaProductoDto } from './create-cita_producto.dto';

export class UpdateCitaProductoDto extends PartialType(CreateCitaProductoDto) {}
