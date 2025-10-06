import { PartialType } from '@nestjs/mapped-types';
import { CreateFacturaDetalleDto } from './create-factura_detalle.dto';

export class UpdateFacturaDetalleDto extends PartialType(CreateFacturaDetalleDto) {}
