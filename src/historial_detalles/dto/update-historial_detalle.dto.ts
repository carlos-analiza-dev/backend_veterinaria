import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialDetalleDto } from './create-historial_detalle.dto';

export class UpdateHistorialDetalleDto extends PartialType(CreateHistorialDetalleDto) {}
